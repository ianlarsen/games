import math,json
from pathlib import Path
R=math.sqrt(2)
def inside(pt,poly):
 x,y=pt;c=False
 for a,b in zip(poly,poly[1:]+poly[:1]):
  if ((a[1]>y)!=(b[1]>y)) and x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]:c=not c
 return c
def solve_rect(w,h):
 templates={'medium':[(0,0),(2,0),(1,1)],'small-a':[(0,0),(1,0),(0,1)],'small-b':[(0,0),(1,0),(0,1)],'square':[(0,0),(1,0),(1,1),(0,1)],'parallelogram':[(0,0),(1,0),(0,1),(-1,1)]}
 probes=[(x+u,y+v) for x in range(w) for y in range(h) for u,v in [(.5,1/6),(5/6,.5),(.5,5/6),(1/6,.5)]]
 candidates={}
 for name,poly in templates.items():
  opts=[]
  for turn in range(4):
   p=poly
   for _ in range(turn):p=[(-y,x) for x,y in p]
   for dx in range(-4,w+4):
    for dy in range(-4,h+4):
     q=[(x+dx,y+dy) for x,y in p]
     if any(x<0 or x>w or y<0 or y>h for x,y in q):continue
     bits=sum(1<<i for i,pt in enumerate(probes) if inside(pt,q))
     if bits:opts.append((bits,q))
  candidates[name]=opts
 def search(names,used,ans):
  if not names:return ans if used==(1<<len(probes))-1 else None
  name=min(names,key=lambda n:sum(not b&used for b,_ in candidates[n]))
  for b,p in candidates[name]:
   if b&used:continue
   found=search([n for n in names if n!=name],used|b,{**ans,name:p})
   if found:return found
 return search(list(templates),0,{})
layouts=[]
cat={'square':[(0,0),(1,1),(0,2),(-1,1)],'small-a':[(-1,1),(0,0),(-1,-1)],'small-b':[(0,0),(1,1),(1,-1)],'large-a':[(0,2),(4,2),(2,4)],'large-b':[(0,2),(2,4),(0,6)],'medium':[(0,2),(-2,2),(0,4)],'parallelogram':[(0,4),(-1,3),(-1,5),(0,6)]}
fish={'large-a':[(0,0),(4,0),(2,-2)],'large-b':[(0,0),(2,2),(4,0)],'medium':[(4,0),(6,-2),(6,0)],'small-a':[(4,0),(6,0),(5,1)],'small-b':[(.5,-.5),(1.5,-1.5),(.5,-2.5)],'square':[(-2,0),(-1,-1),(0,0),(-1,1)],'parallelogram':[(-2,0),(-1,1),(-1,3),(-2,2)]}
swan={'large-a':[(0,0),(4,0),(2,2)],'large-b':[(4,0),(6,2),(2,2)],'medium':[(4,0),(6,0),(6,-2)],'parallelogram':[(4,0),(5,-1),(5,-3),(4,-2)],'square':[(4,-4),(5,-3),(4,-2),(3,-3)],'small-a':[(4,-4),(6,-4),(5,-3)],'small-b':[(0,0),(0,-2),(1,-1)]}
for name,category,parts in [('Cat','Animals',cat),('Fish','Animals',fish),('Swan','Animals',swan)]:layouts.append((name,category,parts))
for w,h,name in [(4,1,'Cottage'),(2,2,'Tall house')]:
 p=solve_rect(w,h)
 print(name,'tiling',p)
 if p:
  p={k:[(x*R,y*R) for x,y in v] for k,v in p.items()}
  p['large-a']=[(0,0),(2*R,-2*R),(2*R,0)]
  p['large-b']=[(2*R,-2*R),(4*R,0),(2*R,0)]
  if w==2:p={k:[(x+(R if k not in ['large-a','large-b'] else 0),y) for x,y in v] for k,v in p.items()}
  layouts.append((name,'Houses',p))
boat={'medium':[(2,0),(4,-2),(4,0)],'small-a':[(2,-2),(3,-3),(3,-1)],'small-b':[(0,0),(1,-1),(2,0)],'square':[(1,-1),(2,-2),(3,-1),(2,0)],'parallelogram':[(3,-3),(4,-4),(4,-2),(3,-1)]}
boat.update({'large-a':[(0,0),(4,0),(2,2)],'large-b':[(4,0),(6,2),(2,2)]})
layouts.append(('Sailboat','Boats',boat))
harbor={k:list(v) for k,v in boat.items()}
harbor['large-b']=[(0,0),(-2,2),(2,2)]
layouts.append(('Harbor sailboat','Boats',harbor))
dest=Path(__file__).resolve().parents[1]
(dest/'assets/shape-builder').mkdir(parents=True,exist_ok=True)
result=[]
order=['large-a','large-b','medium','small-a','small-b','square','parallelogram']
for name,category,parts in layouts:
 vs=[v for p in parts.values() for v in p]; minx=min(x for x,y in vs);miny=min(y for x,y in vs);maxx=max(x for x,y in vs);maxy=max(y for x,y in vs)
 transformed={k:[[round((x-minx)*64+30,5),round((y-miny)*64+30,5)] for x,y in p] for k,p in parts.items()}
 result.append({'id':name.lower().replace(' ','-'),'name':name,'category':category,'viewBox':[0,0,round((maxx-minx)*64+60,5),round((maxy-miny)*64+60,5)],'pieces':[{'piece':k,'targetVertices':transformed[k]} for k in order]})
(dest/'assets/shape-builder/puzzles.json').write_text(json.dumps(result,indent=2))
print('Created',len(result),'named tangrams')
