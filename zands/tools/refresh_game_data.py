from pathlib import Path
import json,hashlib,wave
root=Path(__file__).resolve().parents[1]
names=['treehouse-trail','turtle-reef','rocket-launch','sunflower-cottage','sailboat-bay','dinosaur-valley','fox-garden','unicorn-meadow']
data={'palette':json.loads((root/'assets/paint-studio/palette.json').read_text()),'tangrams':json.loads((root/'assets/shape-builder/puzzles.json').read_text()),'pages':{n:(root/f'assets/paint-studio/coloring-pages/{n}.svg').read_text() for n in names}}
(root/'game-data.js').write_text('window.ZANDS_DATA='+json.dumps(data)+';',encoding='utf-8')
assets=[]
for p in sorted((root/'assets').rglob('*')):
 if not p.is_file():continue
 b=p.read_bytes();entry={'path':p.relative_to(root).as_posix(),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
 if p.suffix=='.wav':
  with wave.open(str(p)) as w:entry.update(seconds=w.getnframes()/w.getframerate(),channels=w.getnchannels(),sampleRate=w.getframerate())
 assets.append(entry)
(root/'asset-manifest.json').write_text(json.dumps({'version':2,'targetRoot':'.','assets':assets},indent=2),encoding='utf-8')
print('Updated game-data.js and',len(assets),'manifest entries')
