from pathlib import Path
import json, math, shutil, wave, subprocess, zipfile, hashlib, xml.etree.ElementTree as ET
import numpy as np
ET.register_namespace('', 'http://www.w3.org/2000/svg')
ROOT=Path(__file__).resolve().parents[1]
A=ROOT/'assets'; manifest=[]
INK='#242139'; COLORS=['#ef4444','#f59e0b','#facc15','#84cc16','#22c55e','#14b8a6','#3b82f6','#4f46e5','#8b5cf6','#d946ef','#ec4899','#f97316']
def write(rel, text):
 p=A/rel;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text,encoding='utf-8');return p
def svg(rel, body, w=256,h=256):
 return write(rel,f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}"><g stroke="{INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">{body}</g></svg>')
def circle(x,y,r,c):return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}"/>'
def rect(x,y,w,h,c,r=10):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{c}"/>'
def path(d,c='none'):return f'<path d="{d}" fill="{c}"/>'
def poly(p,c):return f'<polygon points="{p}" fill="{c}"/>'
def star(x=128,y=128,r=85,c='#facc15'):
 pts=[]
 for i in range(10):
  a=-math.pi/2+i*math.pi/5; rr=r if i%2==0 else r*.46;pts.append(f'{x+math.cos(a)*rr:.2f},{y+math.sin(a)*rr:.2f}')
 return poly(' '.join(pts),c)
def art(kind):
 if kind in ['cat','fox','bear','rabbit','owl','frog','dog','lion','panda','mouse','penguin','turtle']:
  c={'cat':'#f5a342','fox':'#f97316','bear':'#b77c50','rabbit':'#e9d5ff','owl':'#c4a06c','frog':'#65cc72','dog':'#d9a066','lion':'#facc15','panda':'#f8fafc','mouse':'#a8b5cc','penguin':'#64748b','turtle':'#34b78c'}[kind]
  b=''
  if kind=='rabbit':b+=rect(65,15,42,105,c,22)+rect(149,15,42,105,c,22)
  elif kind in ['cat','fox','dog']:b+=poly('49,111 46,31 105,74',c)+poly('151,74 210,31 207,111',c)
  else:b+=circle(65,75,28,c)+circle(191,75,28,c)
  if kind=='lion':b+=circle(128,135,106,'#f59e0b')
  b+=circle(128,135,85,c)+circle(97,122,10,INK)+circle(159,122,10,INK)+circle(128,150,10,'#70433e')+path('M100 173 Q128 197 156 173')
  if kind=='panda':b+=circle(97,122,21,INK)+circle(159,122,21,INK)+circle(97,118,6,'white')+circle(159,118,6,'white')
  return b
 if kind=='rocket':return poly('128,24 180,102 180,185 76,185 76,102','#fb7185')+poly('76,135 40,206 76,192','#8b5cf6')+poly('180,135 216,206 180,192','#8b5cf6')+circle(128,108,27,'#7dd3fc')+poly('98,192 128,242 158,192','#facc15')
 if kind=='planet':return circle(128,128,69,'#a78bfa')+'<ellipse cx="128" cy="128" rx="112" ry="30" transform="rotate(-25 128 128)" fill="none" stroke="#f59e0b" stroke-width="15"/>'
 if kind=='star':return star()
 if kind=='moon':return path('M170 28 A101 101 0 1 0 218 177 A91 91 0 0 1 170 28','#fde68a')
 if kind=='sun':return star(r=110,c='#f59e0b')+circle(128,128,62,'#fde047')
 if kind=='ufo':return path('M73 129 Q76 40 128 40 Q180 40 183 129','#7dd3fc')+'<ellipse cx="128" cy="145" rx="106" ry="34" fill="#a78bfa"/>'+''.join(circle(x,145,9,'#fde047') for x in [60,105,151,196])
 if kind=='astronaut':return rect(75,125,106,106,'#e2e8f0')+circle(128,81,65,'#f8fafc')+rect(83,54,90,59,'#38bdf8',25)
 if kind=='comet':return poly('38,168 211,31 166,139 228,103 118,210','#fb923c')+circle(70,186,42,'#fde047')
 if kind=='satellite':return rect(12,79,72,100,'#38bdf8')+rect(172,79,72,100,'#38bdf8')+rect(89,90,78,83,'#cbd5e1')+path('M128 90 L128 32 M106 32 Q128 62 150 32')
 if kind=='galaxy':return ''.join(f'<ellipse cx="128" cy="128" rx="{95-i*17}" ry="{35-i*5}" transform="rotate({i*33} 128 128)" fill="none" stroke="{COLORS[i+6]}" stroke-width="12"/>' for i in range(5))+circle(128,128,13,'#fde047')
 if kind=='meteor':return poly('20,223 153,35 227,27 224,102 78,236','#fb923c')+circle(164,96,41,'#a16207')+circle(151,84,9,'#fde68a')
 if kind=='earth':return circle(128,128,95,'#38bdf8')+path('M57 80 L90 49 130 69 119 116 91 141 62 115 Z','#4ade80')+path('M136 145 L184 130 210 166 161 207 Z','#4ade80')
 if kind in ['apple','pear','orange','strawberry','grapes','watermelon','banana','carrot','cupcake','ice-cream','pizza','cookie']:
  if kind=='banana':return path('M52 40 Q65 168 212 126 Q161 252 66 188 Q10 142 52 40','#fde047')
  if kind=='carrot':return poly('74,75 183,80 108,229','#fb923c')+path('M111 76 L82 25 M130 77 L136 18 M148 78 L190 34')
  if kind=='pizza':return poly('40,43 213,81 94,232','#fde68a')+path('M40 43 Q118 22 213 81')+circle(107,94,17,'#ef4444')+circle(117,151,17,'#ef4444')
  if kind=='cookie':return circle(128,128,96,'#d7a05b')+''.join(circle(x,y,10,'#6b3f2e') for x,y in [(89,77),(160,88),(128,138),(72,159),(165,178)])
  if kind in ['cupcake','ice-cream']:return poly('76,139 181,139 151,231 106,231','#d6a469')+circle(128,98,61,'#f9a8d4')+circle(91,127,29,'#f9a8d4')+circle(170,127,29,'#f9a8d4')
  if kind=='grapes':return path('M128 55 Q116 16 162 22','#4ade80')+''.join(circle(x,y,28,'#a78bfa') for x,y in [(95,83),(151,83),(74,129),(128,129),(182,129),(101,175),(155,175),(128,218)])
  if kind=='watermelon':return path('M26 89 A104 104 0 0 0 230 89 Z','#4ade80')+path('M44 95 A86 86 0 0 0 212 95 Z','#fb7185')+''.join(circle(x,131,4,INK) for x in [81,126,171])
  c={'apple':'#ef4444','pear':'#a3e635','orange':'#fb923c','strawberry':'#fb7185'}[kind]
  return path('M125 66 Q101 16 156 25','#4ade80')+path('M128 80 C32 27 12 135 76 212 Q128 249 181 211 C244 123 220 31 128 80',c)
 return star(c='#38bdf8')
# Shared icons: custom vector linework, no fonts or emoji.
icons={
'home':poly('32,116 128,32 224,116','#7dd3fc')+rect(55,111,146,115,'#f8fafc')+rect(107,160,43,66,'#a78bfa'),
'play':poly('78,40 213,128 78,216','#4ade80'), 'pause':rect(60,42,43,172,'#38bdf8')+rect(153,42,43,172,'#38bdf8'),
'undo':path('M59 89 Q192 15 210 135 Q217 218 113 217')+poly('62,43 28,109 103,109','#8b5cf6'),
'restart':path('M202 68 A92 92 0 1 0 219 148')+poly('166,69 215,31 221,101','#14b8a6'),
'brush':path('M90 149 L179 24 Q197 13 207 34 L125 173 Z','#a78bfa')+path('M90 148 Q30 153 39 218 Q93 239 126 175 Z','#38bdf8'),
'eraser':poly('36,155 141,36 222,106 117,225 74,225','#f9a8d4')+poly('36,155 74,225 117,225 156,178 78,110','#e2e8f0'),
'fill':poly('67,62 195,117 149,205 27,152','#38bdf8')+path('M105 58 Q148 13 183 71')+path('M214 139 Q249 187 214 204 Q184 188 214 139','#8b5cf6'),
'sound':poly('30,98 79,98 138,51 138,205 79,160 30,160','#38bdf8')+path('M163 89 Q204 128 163 166 M185 63 Q250 128 185 193'),
'music':path('M92 181 L92 61 200 37 200 157 M92 86 L200 63')+circle(65,184,28,'#a78bfa')+circle(173,162,28,'#a78bfa'),
'help':circle(128,128,99,'#7dd3fc')+path('M91 85 Q103 43 148 59 Q198 86 145 120 L128 147')+circle(128,182,5,INK),
'rotate':path('M57 105 A78 78 0 1 1 88 195')+poly('25,94 85,77 62,139','#f59e0b'),
'peek':path('M20 128 Q128 10 236 128 Q128 246 20 128','#f8fafc')+circle(128,128,44,'#38bdf8')+circle(128,128,18,INK),
'save':rect(38,28,180,200,'#38bdf8')+rect(75,28,110,63,'#f8fafc')+rect(75,147,110,81,'#f8fafc'),
'left':poly('184,34 65,128 184,222','#a78bfa'),'right':poly('72,34 191,128 72,222','#38bdf8'),
'check':path('M42 133 L101 193 214 61'), 'close':path('M60 60 L196 196 M196 60 L60 196'),
'lock':rect(53,109,150,121,'#a78bfa')+path('M83 109 L83 74 A45 45 0 0 1 173 74 L173 109')+circle(128,165,10,INK),
'cup':path('M72 35 L184 35 L173 132 Q128 206 83 132 Z','#facc15')+path('M72 57 Q12 31 33 100 Q47 131 85 126 M184 57 Q244 31 223 100 Q209 131 171 126 M128 164 L128 213')+rect(76,213,104,20,'#facc15'),
'plus':path('M128 45 L128 211 M45 128 L211 128'),'minus':path('M45 128 L211 128')}
for n,b in icons.items():svg(f'shared/icons/{n}.svg',b)
# Illustrations reusable for cards and stickers.
themes={'animals':['cat','fox','bear','rabbit','owl','frog','dog','lion','panda','mouse','penguin','turtle'],'space':['rocket','planet','star','moon','sun','ufo','astronaut','comet','satellite','galaxy','meteor','earth'],'food':['apple','pear','orange','strawberry','grapes','watermelon','banana','carrot','cupcake','ice-cream','pizza','cookie']}
for theme,names in themes.items():
 for n in names:svg(f'match-quest/cards/{theme}/{n}.svg',art(n))
svg('match-quest/card-back.svg',rect(12,12,232,232,'#8b5cf6',24)+star(r=62,c='#fde047'))
svg('match-quest/card-frame.svg',rect(9,9,238,238,'#f8fafc',24))
for i,n in enumerate(sum(themes.values(),[])[:16]):svg(f'shared/rewards/sticker-{n}.svg',circle(128,128,119,'white')+f'<g transform="translate(25 25) scale(.8)">{art(n)}</g>')
svg('shared/rewards/star.svg',star());svg('shared/rewards/sparkle.svg',poly('128,10 155,102 246,128 155,154 128,246 102,154 10,128 102,102','#fde047'))
# Eight original full scenes and corresponding region-fillable coloring pages.
scenes=[('space-garden','rocket','planet'),('forest-friends','fox','rabbit'),('pond-party','frog','turtle'),('sweet-picnic','apple','cupcake'),('moon-camp','astronaut','moon'),('sunny-safari','lion','sun'),('ocean-adventure','penguin','star'),('rainbow-hills','bear','butterfly')]
for i,(name,left,right) in enumerate(scenes):
 bg=['#dbeafe','#dcfce7','#ccfbf1','#fce7f3','#ddd6fe','#fef3c7','#cffafe','#e0e7ff'][i]
 body=rect(0,0,800,800,bg,0)+circle(660,120,62,'#fde047')
 for x,y,r in [(85,83,16),(275,130,12),(423,69,13),(571,277,10)]:body+=star(x,y,r,'#f8fafc')
 body+=path('M0 550 Q170 365 390 550 Q590 375 800 530 L800 800 L0 800 Z','#86efac')+path('M0 665 Q240 500 450 645 Q635 530 800 645 L800 800 L0 800 Z','#34d399')
 for x in [36,658]:body+=rect(x+28,400,34,177,'#a16207')+poly(f'{x},467 {x+45},284 {x+94},467','#22c55e')
 body+=f'<g transform="translate(91 277) scale(1.18)">{art(left)}</g><g transform="translate(430 330) scale(1.02)">{art(right)}</g>'
 for x,y,c in [(110,705,'#fb7185'),(365,737,'#a78bfa'),(640,714,'#facc15')]:body+=path(f'M{x} {y+31} L{x} {y}','none')+circle(x,y,19,c)
 svg(f'picture-remix/images/{name}.svg',body,800,800)
 root=ET.fromstring((A/f'picture-remix/images/{name}.svg').read_text());k=0
 for el in root.iter():
  if el.tag.split('}')[-1] in ['path','polygon','circle','rect','ellipse'] and el.get('fill') not in [None,'none']:
   el.set('fill','#ffffff');el.set('id',f'region-{k:03}');el.set('data-colorable','true');k+=1
 write(f'paint-studio/coloring-pages/{name}.svg',ET.tostring(root,encoding='unicode'))
# Backgrounds and menu artwork.
menu={'paint-studio':'brush','picture-remix':'peek','marble-lab':'planet','balance-dash':'left','match-quest':'cat','number-quest':'plus','pattern-beats':'music','shape-builder':'star'}
for i,(game,icon) in enumerate(menu.items()):
 b=icons.get(icon,art(icon));svg(f'shared/menu/{game}.svg',rect(8,8,240,240,COLORS[(i*2)%12],26)+f'<g transform="translate(37 37) scale(.71)">{b}</g>')
 bg=rect(0,0,1280,800,['#fff7ed','#eff6ff','#ecfeff','#f0fdf4','#faf5ff','#fefce8','#eef2ff','#fdf2f8'][i],0)
 for j in range(12):bg+=circle(60+j*109,60+(j%3)*275,23,'#ffffff')
 svg(f'{game}/background.svg',bg,1280,800)
svg('shared/background.svg',rect(0,0,1280,800,'#eef2ff',0)+''.join(star(80+j*160,90+(j%3)*240,27,'#ddd6fe') for j in range(8)),1280,800)
svg('shared/loading.svg',circle(128,128,103,'#ddd6fe')+star(c='#facc15'))
svg('paint-studio/paper.svg',rect(0,0,1000,700,'#fffdf6',0),1000,700)
palette=[('red','#ef4444'),('yellow','#facc15'),('blue','#2563eb'),('orange','#f97316'),('green','#22c55e'),('violet','#8b5cf6'),('vermilion','#e34234'),('amber','#ffbf00'),('chartreuse','#b2e52e'),('teal','#008080'),('indigo','#4b0082'),('magenta','#d600aa'),('black','#20202a'),('white','#ffffff'),('brown','#925c37'),('gray','#8a93a4')]
write('paint-studio/palette.json',json.dumps([{'name':n,'hex':c,'group':'primary' if i<3 else 'secondary' if i<6 else 'tertiary' if i<12 else 'extra'} for i,(n,c) in enumerate(palette)],indent=2))
# Marble parts include matching centerline geometry, connector positions and dimensions.
tracks={
'straight':('M0 64 L128 64',[[0,64],[128,64]]), 'ramp-down':('M0 24 L128 104',[[0,24],[128,104]]),
'ramp-up':('M0 104 L128 24',[[0,104],[128,24]]), 'curve-down':('M0 24 Q104 24 104 128',[[0,24],[104,128]]),
'curve-up':('M24 128 Q24 24 128 24',[[24,128],[128,24]]), 'u-turn':('M0 24 L70 24 Q124 64 70 104 L0 104',[[0,24],[0,104]]),
'funnel':('M12 16 L64 99 L116 16 M64 99 L64 128',[[64,0],[64,128]]), 'drop':('M64 0 L64 128',[[64,0],[64,128]])}
trackmeta=[]
for n,(d,ends) in tracks.items():
 svg(f'marble-lab/tracks/{n}.svg',f'<path d="{d}" stroke="{INK}" stroke-width="24" fill="none"/><path d="{d}" stroke="#38bdf8" stroke-width="16" fill="none"/>',128,128);trackmeta.append({'id':n,'path':d,'connectors':ends,'size':[128,128],'collision':'Use path centerline and a 12-unit outer radius; funnel branches are walls.'})
write('marble-lab/tracks/geometry.json',json.dumps(trackmeta,indent=2))
for i,c in enumerate(['#38bdf8','#f472b6','#facc15','#4ade80']):svg(f'marble-lab/marbles/marble-{i+1}.svg',circle(32,32,27,c)+circle(24,23,7,'white'),64,64)
svg('marble-lab/finish-cup.svg',path('M16 24 L36 112 L92 112 L112 24','#facc15'),128,128)
svg('marble-lab/start-gate.svg',rect(12,12,104,100,'#a78bfa')+circle(64,47,22,'#38bdf8')+path('M34 90 L94 90'),128,128)
svg('marble-lab/connector.svg',circle(24,24,18,'#facc15'),48,48)
# Original matching 2D vector characters; each pose is a separate scalable frame.
for who in ['zion','samaria']:
 for pose in ['idle','walk-1','walk-2','lean-left','lean-right','celebrate','fall','recover']:
  tilt={'lean-left':-16,'lean-right':16,'fall':48,'recover':-8}.get(pose,0);shirt='#2563eb' if who=='zion' else '#b950e8';skin='#b96b32';b=''
  legshift=12 if pose=='walk-1' else -12 if pose=='walk-2' else 0
  b+=path(f'M99 234 L{83+legshift} 292 M155 234 L{172-legshift} 292')+rect(55,280,50,19,'#facc15')+rect(155,280,50,19,'#facc15')
  b+=rect(78,141,104,101,shirt,21)
  arms='M80 167 L35 137 M179 167 L223 137' if pose!='celebrate' else 'M80 165 L29 80 M178 165 L226 80'
  b+=f'<path d="{arms}" stroke="{skin}" stroke-width="21"/>'
  b+=circle(128,92,63,'#211e28')
  if who=='zion':
   for x,y in [(65,72),(82,48),(101,38),(157,38),(176,50),(191,74)]:b+=f'<path d="M{x} {y} Q{x-13} 111 {x-4} 184" stroke="#27232e" stroke-width="23"/>'
  else:
   for x in range(58,204,9):b+=f'<path d="M{x} 69 Q{x-12} 108 {x-3} 142" stroke="#27232e" stroke-width="7"/>'
  b+=circle(128,95,52,skin)+path('M82 66 Q122 27 174 64','#27232e')+circle(108,89,6,INK)+circle(151,89,6,INK)+path('M121 102 Q129 110 138 102')+path('M103 116 Q128 142 154 115 Z','white')
  dx=7 if pose=='walk-1' else -7 if pose=='walk-2' else 0
  svg(f'balance-dash/characters/{who}/{pose}.svg',f'<g transform="translate({dx} 0) rotate({tilt} 128 205)">{b}</g>',256,320)
svg('balance-dash/beam.svg',rect(0,0,640,32,'#d09c64')+path('M15 11 L625 11'),640,40)
svg('balance-dash/obstacle.svg',rect(20,27,88,75,'#fb923c'),128,128)
svg('balance-dash/wind.svg',path('M10 40 L99 40 Q127 40 116 20 M10 67 L91 67 M10 93 L103 93 Q128 93 116 114'),128,128)
for n in ['star','rocket','cupcake']:svg(f'number-quest/objects/{n}.svg',art(n))
svg('number-quest/stepping-stone.svg','<ellipse cx="128" cy="159" rx="113" ry="52" fill="#a78bfa"/>',256,256)
svg('number-quest/platform.svg',rect(12,64,232,126,'#7dd3fc',24))
# Pattern pads: shape and color distinguish each tone.
for i,shape in enumerate([circle(128,128,86,COLORS[0]),rect(43,43,170,170,COLORS[6],22),poly('128,24 230,220 26,220',COLORS[2]),star(c=COLORS[4])]):
 svg(f'pattern-beats/pads/pad-{i+1}.svg',shape);svg(f'pattern-beats/pads/pad-{i+1}-lit.svg',circle(128,128,121,'#fff8c7')+shape)
for n,b in [('drum',rect(30,90,196,124,'#fb7185')+'<ellipse cx="128" cy="90" rx="98" ry="35" fill="#fde68a"/>'),('keys',rect(20,73,216,113,'white')+''.join(rect(x,73,23,67,INK,0) for x in [57,102,166])),('bell',path('M53 183 Q75 156 75 108 Q75 33 128 33 Q181 33 181 108 Q181 156 203 183 Z','#facc15')+circle(128,201,17,'#f59e0b')),('shaker',rect(90,148,76,88,'#a16207')+circle(128,92,70,'#4ade80'))]:svg(f'pattern-beats/instruments/{n}.svg',b)
# Exact seven-piece tangram dissection of a 256-square.
pieces=[('large-a',[(0,0),(256,0),(128,128)]),('large-b',[(0,0),(128,128),(0,256)]),('medium',[(128,256),(256,128),(256,256)]),('small-a',[(128,128),(192,64),(192,192)]),('small-b',[(0,256),(64,192),(128,256)]),('square',[(64,192),(128,128),(192,192),(128,256)]),('parallelogram',[(192,64),(256,0),(256,128),(192,192)])]
for i,(n,pts) in enumerate(pieces):svg(f'shape-builder/pieces/{n}.svg',poly(' '.join(f'{x},{y}' for x,y in pts),COLORS[i]))
# Connected, non-overlapping tangram layouts built by matching boundary edges.
# Store vertices rather than inferred images so the game has exact solutions.
import random
prng=random.Random(41)
def overlap(a,b):
 for polygon in [a,b]:
  for k in range(len(polygon)):
   x,y=polygon[k]; xx,yy=polygon[(k+1)%len(polygon)];axis=(y-yy,xx-x)
   pa=[u*axis[0]+v*axis[1] for u,v in a];pb=[u*axis[0]+v*axis[1] for u,v in b]
   if min(max(pa),max(pb))-max(min(pa),min(pb))<.01:return False
 return True
def attach(shape,edge1,edge2):
 a,b=edge1;c,d=edge2
 angle=math.atan2(b[1]-a[1],b[0]-a[0])-math.atan2(c[1]-d[1],c[0]-d[0]);cs=math.cos(angle);sn=math.sin(angle)
 cx=(c[0]+d[0])/2;cy=(c[1]+d[1])/2;tx=(a[0]+b[0])/2;ty=(a[1]+b[1])/2
 return [(tx+(x-cx)*cs-(y-cy)*sn,ty+(x-cx)*sn+(y-cy)*cs) for x,y in shape]
solutions=[]
for idx in range(20):
 name='classic-square' if idx==0 else f'connected-design-{idx:02}'
 placed=[pieces[0][1]]
 if idx==0:placed=[pts for _,pts in pieces]
 else:
  for _,shape in pieces[1:]:
   candidates=[]
   for existing in placed:
    for k in range(len(existing)):
     edge1=(existing[k],existing[(k+1)%len(existing)])
     for j in range(len(shape)):
      candidate=attach(shape,edge1,(shape[j],shape[(j+1)%len(shape)]))
      if not any(overlap(candidate,q) for q in placed):candidates.append(candidate)
   assert candidates, 'No connected placement found'
   placed.append(prng.choice(candidates))
 xs=[x for q in placed for x,y in q];ys=[y for q in placed for x,y in q]
 dx=40-min(xs);dy=40-min(ys);width=math.ceil(max(xs)-min(xs)+80);height=math.ceil(max(ys)-min(ys)+80)
 body='';preview='';placements=[]
 for j,((n,_),pts) in enumerate(zip(pieces,placed)):
  transformed=[(x+dx,y+dy) for x,y in pts];points=' '.join(f'{x:.3f},{y:.3f}' for x,y in transformed)
  body+=poly(points,INK);preview+=poly(points,COLORS[j]);placements.append({'piece':n,'targetVertices':transformed})
 for j in range(7):
  for k in range(j):assert not overlap(placed[j],placed[k]), 'Tangram overlap'
 svg(f'shape-builder/targets/{idx+1:02}-{name}.svg',body,width,height)
 svg(f'shape-builder/solutions/{idx+1:02}-{name}.svg',preview,width,height)
 solutions.append({'id':f'{idx+1:02}-{name}','viewBox':[0,0,width,height],'pieces':placements})
write('shape-builder/puzzles.json',json.dumps(solutions,indent=2))
# Audio: deterministic original compositions, integer-bar seamless periodic rendering.
SR=22050;rng=np.random.default_rng(27)
def tone(freq,dur,style='keys'):
 t=np.arange(int(SR*dur))/SR
 if style=='mallet':s=np.sin(2*np.pi*freq*t)+.24*np.sin(2*np.pi*freq*3*t);env=np.exp(-t*8)
 elif style=='pluck':s=np.sin(2*np.pi*freq*t)+.3*np.sin(2*np.pi*freq*2*t);env=np.exp(-t*6)
 else:s=np.sin(2*np.pi*freq*t)+.17*np.sin(2*np.pi*freq*2*t);env=np.exp(-t*3)
 env*=np.minimum(t/.009,1)*np.minimum((dur-t)/.045,1);return s*env
# Mix wrap-around tails for truly repeating musical sections.
def add(buf,s,at,amp=1):
 ix=(int(at*SR)+np.arange(len(s)))%len(buf);np.add.at(buf,ix,s*amp)
def save_audio(rel,buf):
 peak=np.max(np.abs(buf));buf=buf/max(1,peak/.80);p=A/rel;p.parent.mkdir(parents=True,exist_ok=True)
 with wave.open(str(p),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((buf*32767).astype('<i2').tobytes())
 return p
def midi(n):return 440*2**((n-69)/12)
tracks_audio=[]
for gi,game in enumerate(['main-menu']+list(menu)):
 bpm=[96,88,104,108,112,92,110,100,86][gi];beat=60/bpm;duration=beat*4*20;buf=np.zeros(round(duration*SR));style=['keys','keys','pluck','mallet','pluck','mallet','keys','mallet','mallet'][gi]
 root=48+[0,2,5,7,0,5,2,7,0][gi]; motif=[0,4,7,9,7,4,2,4] if gi%2==0 else [0,7,4,2,4,9,7,4]
 for bar in range(20):
  chord=[0,5,9,7][bar%4];start=bar*4*beat
  for note in [root+chord,root+chord+4,root+chord+7]:add(buf,tone(midi(note+12),beat*3.8,style),start,.07)
  for step in range(8):
   if gi==7 and step%2:continue
   note=root+24+motif[(step+bar+gi)%8];add(buf,tone(midi(note),beat*.65,style),start+step*beat/2,.12 if gi!=7 else .055)
  for bt in range(4):
   at=start+bt*beat;add(buf,tone(midi(root+chord),beat*.65,'pluck'),at,.15)
   t=np.arange(int(.17*SR))/SR;kick=np.sin(2*np.pi*(46*t+5*(1-np.exp(-t*35))))*np.exp(-t*24);add(buf,kick,at,.17)
   if bt%2:
    t=np.arange(int(.13*SR))/SR;add(buf,rng.normal(0,1,len(t))*np.exp(-t*43),at,.055)
   for half in [0,.5]:
    t=np.arange(int(.045*SR))/SR;noise=rng.normal(0,1,len(t));noise=np.r_[0,np.diff(noise)]*.5;add(buf,noise*np.exp(-t*85),at+half*beat,.025)
 p=save_audio(f'audio/music/{game}.wav',buf*.68)
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(p),'-c:a','libvorbis','-q:a','4',str(p.with_suffix('.ogg'))],check=True)
 tracks_audio.append({'id':game,'wav':f'assets/audio/music/{game}.wav','ogg':f'assets/audio/music/{game}.ogg','bpm':bpm,'bars':20,'duration':len(buf)/SR,'loop':True})
write('audio/music/loops.json',json.dumps(tracks_audio,indent=2))
effects={'click':[84],'pickup':[67,72],'place':[72,76],'snap':[76,84],'correct':[72,76,79],'retry':[64,60],'win':[72,76,79,84,79,84],'reward':[84,88,91],'card-flip':[79],'paint-pop':[88],'brush':[60],'marble-release':[76,64],'marble-impact':[48],'footstep':[42],'wobble':[60,61,60],'landing':[40,48],'rotate':[79,81]}
for n,notes in effects.items():
 dur=.12*len(notes)+.32;buf=np.zeros(int(dur*SR))
 for k,note in enumerate(notes):add(buf,tone(midi(note),.26,'mallet'),k*.12,.35)
 save_audio(f'audio/sfx/{n}.wav',buf)
for i,note in enumerate([60,64,67,72]):save_audio(f'audio/pattern-tones/pad-{i+1}.wav',tone(midi(note),.55,'mallet')*.4)
t=np.arange(2*SR)/SR;noise=rng.normal(0,1,len(t));roll=(np.sin(2*np.pi*92*t)*.035+noise*.018)*(0.65+.35*np.sin(2*np.pi*7*t)**2);roll*=np.minimum(t/.03,1)*np.minimum((2-t)/.03,1)
save_audio('audio/sfx/marble-roll.wav',roll)
# Approved logo copied without alterations.
source=ROOT.parent/'generated_images/exec-4a585ad6-26e8-4a7f-872a-8089cce07922.png'
(A/'shared/branding').mkdir(parents=True,exist_ok=True);shutil.copy2(source,A/'shared/branding/zands-logo.png')
# Portable preview (no index.html: that remains reserved for the eventual game).
files=sorted(p for p in A.rglob('*') if p.is_file())
for p in files:
 entry={'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
 if p.suffix=='.svg':ET.parse(p)
 if p.suffix=='.wav':
  with wave.open(str(p)) as w:entry['seconds']=w.getnframes()/w.getframerate()
 manifest.append(entry)
(ROOT/'asset-manifest.json').write_text(json.dumps({'version':1,'targetRoot':r'C:\Users\ianla\Documents\games\zands','assets':manifest},indent=2))
items=''
for p in files:
 rel=p.relative_to(ROOT).as_posix()
 if p.suffix in ['.svg','.png']:items+=f'<figure><img loading="lazy" src="{rel}" alt="{p.stem}"><figcaption>{rel}</figcaption></figure>'
 elif p.suffix=='.wav':items+=f'<figure><audio controls preload="none" src="{rel}"></audio><figcaption>{rel}</figcaption></figure>'
(ROOT/'asset-preview.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Z &amp; S Asset Gallery</title><style>body{font-family:system-ui;background:#eef2ff;color:#242139;margin:24px}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:20px}figure{margin:0;background:white;padding:15px;border-radius:16px}img{width:100%;height:200px;object-fit:contain}figcaption{font-size:12px;overflow-wrap:anywhere;margin-top:10px}audio{width:100%}</style><h1>Z &amp; S Asset Gallery</h1><p>Original vector graphics and synthesized music. Press play to audition each sound.</p><main>'+items+'</main></html>')
(ROOT/'README.txt').write_text('Z & S ASSET PACK\n\nExtract the CONTENTS of this folder into:\nC:\\Users\\ianla\\Documents\\games\\zands\n\nassets should be directly under zands. Open asset-preview.html to inspect the artwork and play audio. index.html is intentionally reserved for the future game. No playable app is included yet.\n\nAll SVG graphics are original code-drawn artwork; no emoji, stock images, external fonts, or network dependencies. Logo is the approved generated illustration. Vector characters are new simplified renditions rather than exact crops of the logo. Music is original synthesized instrumental audio. Nine 20-bar loops, WAV and OGG versions, plus effects and four pattern tones. Music is arranged with periodic tails for WAV looping; use decoded audio buffers for reliable loops.\n\nColoring pages: inline the SVG for per-region tap fill, using data-colorable and region IDs. Background regions can also be filled. Puzzle pictures: rasterize SVG to canvas and cut into a 4x4 grid. Track geometry includes connector positions and path centerlines; physics is not included. Tangram targets include exact per-piece vertices; reflection is not required.\n\nAudio should begin only after a user tap. Music and effects need separate controls. Use low background music volume, especially in Pattern Beats. All audio is mono 22050Hz, 16-bit PCM WAV; music also available in OGG.\n\nSource generation script: tools/build_assets.py (Python + NumPy + FFmpeg). asset-manifest.json lists all assets and hashes.\n')
print(json.dumps({'assets':len(files),'svg':sum(p.suffix=='.svg' for p in files),'music_loops':len(tracks_audio),'wav':sum(p.suffix=='.wav' for p in files)},indent=2))
