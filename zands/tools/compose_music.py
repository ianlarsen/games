from pathlib import Path
import numpy as np,math,wave,subprocess,sys,json
import imageio_ffmpeg
FF=imageio_ffmpeg.get_ffmpeg_exe()
ROOT=Path(__file__).resolve().parents[1];TEMP=ROOT/'.build/audio-render';TEMP.mkdir(parents=True,exist_ok=True)
SR=44100
def hz(m):return 440*2**((m-69)/12)
cache={}
def instrument(m,dur,kind):
 key=(m,round(dur,3),kind)
 if key in cache:return cache[key]
 t=np.arange(int(dur*SR),dtype=np.float32)/SR;f=hz(m);s=np.zeros(len(t),np.float32)
 if kind in ['piano','guitar','bell']:
  count=9 if kind=='piano' else 7
  for n in range(1,count+1):
   decay=(2.1 if kind=='piano' else 1.5 if kind=='guitar' else 2.7)/(n**.6)
   amp=(1/n**(1.7 if kind=='piano' else 1.45 if kind=='guitar' else 2.8))*np.exp(-t/decay)
   s+=amp*np.sin(2*np.pi*f*n*(1+.00006*n*n)*t)
  if kind=='piano':s+=.025*np.sin(2*np.pi*f*.997*t)*np.exp(-t/.6)
  if kind=='guitar':s+=.05*np.sin(2*np.pi*f*2.004*t)*np.exp(-t/.15)
  attack=.012 if kind=='piano' else .025 if kind=='guitar' else .022
 elif kind=='bass':
  s=(np.sin(2*np.pi*f*t)+.22*np.sin(2*np.pi*f*2*t)+.07*np.sin(2*np.pi*f*3*t))*np.exp(-t/1.1);attack=.015
 else:
  s=(np.sin(2*np.pi*f*.998*t)+np.sin(2*np.pi*f*1.002*t)+.12*np.sin(2*np.pi*f*2*t))*.5;attack=.22
 env=np.minimum(t/attack,1)*np.minimum((dur-t)/.22,1);s*=np.maximum(0,env)
 cache[key]=s;return s
def place(buf,s,sec,gain=1,pan=0):
 start=int(sec*SR)%len(buf);l=gain*math.sqrt((1-pan)/2);r=gain*math.sqrt((1+pan)/2);n=len(s);end=start+n
 if end<=len(buf):buf[start:end,0]+=s*l;buf[start:end,1]+=s*r
 else:
  first=len(buf)-start;buf[start:,0]+=s[:first]*l;buf[start:,1]+=s[:first]*r;buf[:n-first,0]+=s[first:]*l;buf[:n-first,1]+=s[first:]*r
def save_wav(p,b):
 if b.ndim==1:b=b[:,None]
 with wave.open(str(p),'wb') as w:w.setnchannels(b.shape[1]);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(b,-1,1)*32767).astype('<i2').tobytes())
def room(b):
 dry=b.copy();wet=np.zeros_like(b)
 for delay,g,p in [(.029,.07,0),(.043,.065,1),(.079,.05,0),(.113,.055,1),(.157,.044,0),(.211,.038,1),(.293,.027,0),(.389,.018,1),(.527,.012,0)]:
  shifted=np.roll(dry,int(SR*delay),axis=0);wet+=shifted[:,::-1] * g if p else shifted*g
 return b+wet
def master(b):
 b=room(b);b-=np.mean(b,axis=0);rms=np.sqrt(np.mean(b*b));b*=.105/max(.0001,rms);b=.91*np.tanh(b/.91)
 # Remove sub-audible DC and apply a gentle master high-frequency rolloff.
 spec=np.fft.rfft(b,axis=0);freq=np.fft.rfftfreq(len(b),1/SR);curve=(1-np.exp(-(freq/28)**2))/np.sqrt(1+(freq/6500)**4);spec*=curve[:,None];b=np.fft.irfft(spec,n=len(b),axis=0).astype(np.float32)
 if np.max(abs(b))>.86:b*=.86/np.max(abs(b))
 return b
tracks=[('main-menu',94,48,'piano'),('paint-studio',84,50,'guitar'),('picture-remix',102,53,'piano'),('match-quest',96,48,'bell'),('number-quest',98,55,'guitar'),('pattern-beats',86,50,'piano'),('shape-builder',90,53,'piano')]
meta=[]
for gi,(name,bpm,key,lead) in enumerate(tracks):
 beat=60/bpm;bars=24;dur=bars*4*beat;mix=np.zeros((round(dur*SR),2),np.float32);rng=np.random.default_rng(1901+gi)
 # Diatonic seventh/ninth voicings with a complete 8-bar phrase.
 chords=[(0,[0,4,7,11]),(9,[9,12,16,19]),(5,[5,9,12,16]),(7,[7,11,14,17]),(2,[2,5,9,12]),(5,[5,9,12,16]),(7,[7,11,14,17]),(0,[0,4,7,11])]
 motifs=[[0,4,7,11,9,7,4,2],[4,7,9,12,11,7,4,0],[7,4,2,0,2,4,7,9],[9,7,4,2,0,4,2,0]]
 for bar in range(bars):
  root,voicing=chords[bar%8];at=bar*4*beat;section=bar//8;density=.65 if name=='pattern-beats' else 1
  # Wide felt piano chords, slow warm pads, plucked offbeat inner voices.
  for vi,n in enumerate(voicing):
   place(mix,instrument(key+n+12,beat*3.7,'piano'),at+vi*.016,.075*density,[-.45,-.18,.2,.48][vi])
   if section>0:place(mix,instrument(key+n+12,beat*4.4,'pad'),at,.016*density,(-.55 if vi%2 else .55))
   for pulse in ([1.5,3.25] if section!=1 else [.75,2.5]):place(mix,instrument(key+n+12,beat*.9,'guitar'),at+pulse*beat,.026*density,vi/4-.4)
  for pulse,n in [(0,key+root),(1.5,key+root+7),(2.5,key+root),(3.5,key+root+12)]:place(mix,instrument(n-12,beat*.85,'bass'),at+pulse*beat,.15,0)
  motif=motifs[(bar//2+gi+section)%4]
  rhythm=[0,.75,1.5,2.0,2.75,3.5] if section!=1 else [.25,1,1.75,2.5,3.25]
  if name=='pattern-beats':rhythm=[0,2.5]
  for ni,pulse in enumerate(rhythm):
   # Chord tones on strong beats; gentle passing notes in between.
   note=key+24+(voicing[ni%4] if pulse%1==0 else motif[(ni+bar)%8]);length=beat*(.85 if ni%3 else 1.3)
   place(mix,instrument(note,length+.3,lead),at+pulse*beat+rng.uniform(-.008,.008),(.08+.025*rng.random())*density,math.sin(ni+bar)*.18)
  # A soft acoustic-feeling kick, brushed snare, and understated shaker.
  for pulse in [0,2]:
   t=np.arange(int(.19*SR))/SR;kick=np.sin(2*np.pi*(48*t+1.9*(1-np.exp(-t*24))))*np.exp(-t*26)*np.minimum(t/.006,1)
   place(mix,kick.astype(np.float32),at+pulse*beat,.115*density)
  for pulse in [1,3]:
   t=np.arange(int(.15*SR))/SR;noise=rng.normal(0,1,len(t));noise=np.convolve(noise,np.ones(11)/11,'same');snare=(noise*.75+.13*np.sin(2*np.pi*175*t))*np.exp(-t*28)*np.minimum(t/.008,1)
   place(mix,snare.astype(np.float32),at+pulse*beat,.09*density,.16)
  if name!='pattern-beats':
   for step in range(8):
    t=np.arange(int(.07*SR))/SR;noise=rng.normal(0,1,len(t));smooth=np.convolve(noise,np.ones(5)/5,'same');shaker=(noise-smooth)*np.exp(-t*65)*np.minimum(t/.009,1)
    place(mix,shaker.astype(np.float32),at+(step*.5+(0.035 if step%2 else 0))*beat,.012 if step%2 else .008,-.35)
 mix=master(mix);wav=TEMP/(name+'.wav');save_wav(wav,mix);out=ROOT/'assets/audio/music'/(name+'.mp3')
 subprocess.run([FF,'-hide_banner','-loglevel','error','-y','-i',str(wav),'-c:a','libmp3lame','-b:a','160k',str(out)],check=True)
 meta.append({'id':name,'file':f'assets/audio/music/{name}.mp3','bpm':bpm,'bars':bars,'duration':round(dur,3),'sampleRate':SR,'channels':2,'loop':True})
 print(name,round(dur,1),'seconds','peak',round(float(np.max(abs(mix))),3),'RMS',round(float(np.sqrt(np.mean(mix*mix))),3),flush=True)
 cache.clear()
for i,n in enumerate([60,64,67,72]):
 b=instrument(n,.72,'piano')*.21;b=np.column_stack([b,b]);b=room(b);save_wav(ROOT/f'assets/audio/pattern-tones/pad-{i+1}.wav',b)
fx={'click':[79],'pickup':[64,67],'place':[67,72],'snap':[72,79],'correct':[60,64,67],'retry':[62,60],'win':[60,64,67,72,76],'reward':[67,72,76],'card-flip':[72],'paint-pop':[76],'brush':[60],'rotate':[67,72]}
for name,notes in fx.items():
 dur=.28+.11*len(notes);b=np.zeros((int(dur*SR),2),np.float32)
 for i,n in enumerate(notes):place(b,instrument(n,.27,'piano'),i*.09,.15,0)
 save_wav(ROOT/f'assets/audio/sfx/{name}.wav',room(b))
(ROOT/'assets/audio/music/loops.json').write_text(json.dumps(meta,indent=2))
print('Finished stereo music and gentle tones',flush=True)
