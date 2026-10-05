from pathlib import Path
import random,html
ROOT=Path(__file__).resolve().parents[1]
class Art:
 def __init__(self,color):self.color=color;self.parts=[];self.n=0
 def shape(self,tag,fill,**attrs):
  self.n+=1;attrs={'id':f'region-{self.n}','data-colorable':'true',**attrs,'fill':fill if self.color else 'white'}
  self.parts.append('<'+tag+' '+' '.join(f'{k.replace("_","-")}="{html.escape(str(v))}"' for k,v in attrs.items())+'/>')
 def path(self,d,c):self.shape('path',c,d=d)
 def ellipse(self,x,y,rx,ry,c):self.shape('ellipse',c,cx=x,cy=y,rx=rx,ry=ry)
 def circle(self,x,y,r,c):self.shape('circle',c,cx=x,cy=y,r=r)
 def rect(self,x,y,w,h,c,rx=0):self.shape('rect',c,x=x,y=y,width=w,height=h,rx=rx)
 def poly(self,pts,c):self.shape('polygon',c,points=' '.join(f'{x},{y}' for x,y in pts))
 def line(self,d,stroke='#29394a',width=4):self.parts.append(f'<path d="{d}" fill="none" stroke="{stroke if self.color else "#29394a"}" stroke-width="{width}"/>')
 def fixed(self,x,y,r,c='#29394a'):self.parts.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}" stroke="none"/>')
 def cloud(self,x,y,s=1):self.path(f'M{x-48*s} {y} Q{x-58*s} {y-26*s} {x-24*s} {y-29*s} Q{x-10*s} {y-72*s} {x+25*s} {y-40*s} Q{x+63*s} {y-47*s} {x+65*s} {y-12*s} Q{x+89*s} {y+16*s} {x+42*s} {y+18*s} H{x-24*s} Q{x-55*s} {y+18*s} {x-48*s} {y}Z','#fff5e5')
 def flower(self,x,y,s=1,c='#ffd56e'):
  self.line(f'M{x} {y}V{y+44*s}', '#456f4b',4)
  for dx,dy in [(0,-14),(13,-5),(8,11),(-8,11),(-13,-5)]:self.circle(x+dx*s,y+dy*s,11*s,c)
  self.circle(x,y,9*s,'#f2a657')
 def tree(self,x,y,s=1):
  self.path(f'M{x-14*s} {y} L{x-24*s} {y+135*s} H{x+30*s} L{x+16*s} {y}Z','#c68a51')
  self.path(f'M{x-75*s} {y+4*s} Q{x-122*s} {y-46*s} {x-73*s} {y-83*s} Q{x-90*s} {y-150*s} {x-24*s} {y-145*s} Q{x+8*s} {y-204*s} {x+57*s} {y-149*s} Q{x+130*s} {y-148*s} {x+112*s} {y-74*s} Q{x+156*s} {y-2*s} {x+81*s} {y+18*s}Z','#69bd86')
  self.line(f'M{x-4*s} {y+100*s}V{y+28*s} M{x+3*s} {y+82*s}l{19*s} {-24*s}', '#8a593c',3)
 def stars(self):
  for x,y,s in [(92,92,13),(253,148,9),(466,83,15),(706,173,11),(121,315,8),(583,287,10)]:
   self.poly([(x,y-s),(x+4,y-4),(x+s,y),(x+4,y+4),(x,y+s),(x-4,y+4),(x-s,y),(x-4,y-4)],'#ffdf7e')
 def face(self,x,y,s=1):
  self.fixed(x-17*s,y,4*s);self.fixed(x+17*s,y,4*s);self.line(f'M{x-9*s} {y+17*s}Q{x} {y+26*s} {x+9*s} {y+17*s}',width=3)
 def finish(self):
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800"><g stroke="#29394a" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round">'+''.join(self.parts)+'</g></svg>'

def scene(name,color):
 a=Art(color);a.rect(0,0,800,800,{'turtle-reef':'#b8e8f2','rocket-launch':'#253967'}.get(name,'#d8eef7'))
 if name not in ['turtle-reef','rocket-launch']:
  a.circle(659,109,50,'#ffda75');a.cloud(140,124,1.1);a.cloud(411,188,.8);a.path('M0 512Q120 440 290 514Q457 457 630 490Q710 451 800 480V800H0Z','#95d4aa')
 if name=='treehouse-trail':
  a.path('M355 800Q560 615 467 490L423 490Q471 640 187 800Z','#eac486');a.tree(365,425,1.75);a.tree(704,557,.55)
  a.rect(284,269,219,167,'#e9b476',12);a.poly([(260,285),(393,181),(526,285)],'#b96565');a.rect(375,328,62,108,'#825b54',5);a.rect(300,301,54,58,'#a2dcf1',8);a.line('M327 302V357 M302 330H351');a.rect(461,313,29,31,'#ffd875',6)
  a.path('M266 427H530V449H266Z','#b8824f');a.line('M323 451L281 633 M367 451L325 642',width=10)
  for i in range(6):a.line(f'M{317-i*7} {473+i*27}L{359-i*7} {473+i*27}',width=6)
  a.ellipse(123,633,68,58,'#d09d79');a.circle(91,581,27,'#d09d79');a.circle(156,581,25,'#d09d79');a.ellipse(122,607,54,46,'#d09d79');a.ellipse(120,622,23,17,'#f0c49c');a.face(121,606,.8);a.fixed(121,618,5);a.path('M181 656Q246 604 231 685Q208 712 162 685Z','#d09d79')
  a.flower(565,681,1.3);a.flower(667,732,.9,'#dba9ee');a.flower(66,747,.8,'#ee9d9d')
 elif name=='turtle-reef':
  for x,y,r in [(78,109,18),(164,286,12),(702,294,24),(528,111,13),(382,218,9)]:a.circle(x,y,r,'#e9fcff')
  a.path('M0 647Q173 583 334 671Q530 615 800 632V800H0Z','#f7d39a');a.path('M65 731Q19 589 47 523Q99 610 93 652Q126 601 155 563Q186 650 143 741Z','#70baa0')
  a.ellipse(445,414,141,93,'#66b3a0');a.ellipse(596,403,59,45,'#97d3a8');a.path('M352 434Q235 482 279 526Q329 548 404 459Z','#97d3a8');a.path('M476 480Q533 576 581 522Q591 470 520 436Z','#97d3a8');a.path('M351 376Q260 315 254 359Q260 408 336 413Z','#97d3a8');a.ellipse(447,402,121,80,'#d2b36a');a.poly([(410,341),(472,342),(505,396),(473,451),(410,451),(377,397)],'#ba985a');a.line('M377 397L328 398 M505 396L563 398 M410 341L389 334 M472 342L505 336 M410 451L393 468 M473 451L503 462');a.fixed(614,391,6);a.line('M618 415Q639 414 642 405')
  a.path('M607 750V648Q571 602 603 579Q632 581 628 628V670Q654 638 669 672Q667 697 628 704V750Z','#ef9b97');a.path('M217 765V671Q181 648 196 625Q219 610 235 648V694Q263 652 281 675Q284 709 236 726V765Z','#b3a1db')
  for x,y,c in [(180,166,'#ffc67c'),(697,523,'#eeaaa0')]:a.ellipse(x,y,51,28,c);a.poly([(x-47,y),(x-80,y-26),(x-80,y+26)],c);a.fixed(x+24,y-6,4);a.line(f'M{x} {y-24}Q{x-13} {y} {x} {y+24}')
  a.poly([(366,717),(382,678),(399,717),(435,721),(408,746),(418,779),(383,762),(351,782),(358,745),(334,723)],'#efb687')
 elif name=='rocket-launch':
  a.stars();a.circle(641,134,74,'#e4c98d');a.circle(621,111,17,'#c5aa79');a.circle(664,149,22,'#c5aa79');a.ellipse(153,256,76,42,'#bf95d9');a.parts.append('<ellipse cx="153" cy="256" rx="105" ry="19" transform="rotate(-24 153 256)" fill="none" stroke="#d9bbf3" stroke-width="13"/>')
  a.path('M0 731Q193 659 320 711Q504 662 800 712V800H0Z','#8095b1');a.path('M324 573L302 682L359 656L400 751L441 656L497 682L477 573Z','#ffbd6e');a.path('M359 574L345 641L400 698L455 641L443 574Z','#fff0ab')
  a.path('M345 433L275 553L275 638L355 592Z','#a6cee8');a.path('M455 433L525 553L525 638L445 592Z','#a6cee8');a.path('M345 556V367Q353 259 400 215Q447 259 455 367V556Z','#ed9e9d');a.path('M347 362Q359 273 400 215Q442 273 453 362Z','#d45e75');a.circle(400,414,46,'#fff1ce');a.circle(400,414,32,'#9cd5e6');a.path('M345 527H455V565H345Z','#e8cba4');a.rect(364,482,72,17,'#b76577',8)
  a.path('M74 631L47 735H145L121 631Z','#ccd9de');a.circle(99,594,42,'#f6ead1');a.rect(71,580,58,33,'#94cbd8',14);a.line('M52 665L23 696 M141 665L163 638',width=13);a.rect(181,705,137,34,'#b7c8d6',9);a.line('M211 705V632 M277 705V652',width=7);a.poly([(211,635),(187,675),(234,675)],'#ffd47b')
 elif name=='sunflower-cottage':
  a.path('M267 800L405 633L491 633L544 800Z','#efd0a1');a.tree(706,490,.8);a.rect(194,352,353,283,'#f5d596',14);a.rect(453,216,51,136,'#b97869',6);a.poly([(166,365),(370,197),(572,365)],'#d97570');a.path('M185 351L370 211L554 351','#e7a47e');a.rect(331,472,80,163,'#a2c6cb',8);a.circle(397,555,6,'#efd185');a.rect(218,409,79,93,'#9bd4e8',9);a.line('M257 410V500 M219 455H296');a.rect(450,410,74,91,'#9bd4e8',9);a.line('M487 410V500 M451 455H523');a.rect(207,495,99,19,'#c98671',4);a.rect(438,495,99,19,'#c98671',4)
  a.line('M71 745V546 M145 745V527 M620 751V599', '#58794e',8);a.flower(73,545,2,'#f9cf65');a.flower(145,526,1.65,'#f9cf65');a.flower(621,599,1.5,'#f9cf65');a.path('M60 700Q-1 649 41 633Q86 648 71 686Z','#81bb78');a.path('M139 650Q210 600 201 651Q177 689 142 681Z','#81bb78');a.rect(656,670,82,92,'#c69378',10);a.line('M657 682H738 M657 716H738 M658 748H737');a.cloud(516,137,.7)
 elif name=='sailboat-bay':
  a.path('M0 474Q201 440 381 472Q601 432 800 473V800H0Z','#8bcad8');a.path('M0 619Q123 588 268 639Q436 589 600 636Q737 585 800 615V800H0Z','#67b6c9');a.path('M137 522H650L553 640H241Z','#b98673');a.path('M163 539H621L589 575H191Z','#f5d49b');a.line('M392 527V163', '#675353',10);a.poly([(377,194),(181,494),(377,494)],'#fff1ce');a.poly([(409,180),(409,492),(612,492)],'#edaaa4');a.path('M409 247L577 447H409Z','#e28c94');a.poly([(396,164),(469,181),(398,201)],'#d88ed0');a.circle(291,577,16,'#fff4d9');a.circle(502,577,16,'#fff4d9')
  a.path('M672 446V302H738V446Z','#f4eed0');a.path('M668 376H742V403H668Z','#e29a86');a.poly([(661,302),(705,256),(749,302)],'#ca7f81');a.rect(685,315,39,32,'#9dd0de',4);a.path('M632 456L704 427L776 458Z','#bdad8d')
  for x,y,l in [(80,560,53),(608,708,78),(310,744,84),(31,724,62),(691,527,54)]:a.line(f'M{x} {y}q{l/2} 19 {l} 0', '#428ea9',4)
  a.ellipse(90,682,34,18,'#e9bd85');a.path('M102 671Q122 641 131 666Q120 686 103 681Z','#e9bd85');a.fixed(128,661,3)
 elif name=='dinosaur-valley':
  a.poly([(45,525),(229,280),(400,528)],'#9cbba9');a.poly([(168,362),(229,280),(288,365),(241,343),(218,362)],'#f7f2db');a.poly([(457,513),(620,284),(789,512)],'#adc9b4');a.tree(712,593,.65)
  a.path('M230 615Q130 651 107 551Q171 593 250 518Q304 459 399 491L459 470L469 382Q450 293 523 277Q591 267 603 320Q606 358 558 372L552 489Q625 561 556 617L537 711H480L473 625H363L350 711H293L281 625Z','#83b9a0');a.path('M355 616Q405 553 477 551Q523 559 536 606L506 629H366Z','#b8d9a9');a.ellipse(552,326,45,29,'#a5ccab');a.fixed(567,309,6);a.line('M572 339Q591 342 600 328');a.line('M298 708H348 M483 708H533');a.poly([(265,510),(280,460),(315,487)],'#daa59a');a.poly([(326,488),(349,444),(376,480)],'#daa59a');a.poly([(393,486),(422,447),(439,482)],'#daa59a');a.ellipse(646,693,41,55,'#f7e1b7');a.path('M610 694L629 674L652 696L670 679L685 696','#c5b29a');a.flower(172,742,1.3,'#eebac7');a.flower(694,770,.8)
 elif name=='fox-garden':
  a.tree(162,426,1.15);a.path('M549 672Q666 541 747 632Q764 740 630 751Q569 730 549 672Z','#dc9771');a.path('M684 611Q759 620 745 691Q720 685 680 655Z','#fff0d4');a.ellipse(449,624,126,110,'#e5a578');a.path('M366 676L345 743H413L420 681 M482 681L500 743H558L542 668Z','#df9b70');a.poly([(330,431),(329,302),(423,382)],'#df956d');a.poly([(469,382),(552,308),(565,444)],'#df956d');a.poly([(347,386),(345,335),(391,383)],'#f2cbb3');a.poly([(496,385),(537,339),(543,396)],'#f2cbb3');a.path('M325 405Q446 345 569 412L544 503L447 569L351 504Z','#e3a273');a.path('M334 439L447 508L561 443L539 503L447 554L356 502Z','#fff0d5');a.fixed(389,434,8);a.fixed(507,434,8);a.parts.append('<path d="M431 487Q447 480 462 487L447 502Z" fill="#29394a"/>');a.line('M447 503V520 M421 520Q447 535 473 520')
  a.flower(91,696,1.4,'#f3b8b6');a.flower(244,755,1.25,'#e7bd7e');a.flower(650,497,1.4,'#bda3d3');a.path('M600 402Q568 379 590 355Q616 347 621 379Q646 347 668 365Q679 396 636 413Z','#e7b4c9');a.line('M621 374L631 422',width=3)
 elif name=='unicorn-meadow':
  a.path('M137 299Q373 54 641 291L617 309Q373 98 163 322Z','#f1b5b8');a.path('M163 322Q373 98 617 309L595 325Q373 134 189 346Z','#f7d38c');a.path('M189 346Q373 134 595 325L575 345Q373 175 210 368Z','#a9d5bb');a.path('M210 368Q373 175 575 345L554 365Q373 212 231 391Z','#b4c8e2')
  a.path('M261 585Q156 610 191 484Q198 427 252 465Q211 514 275 512Z','#d0b0de');a.ellipse(376,574,131,78,'#fff1df');a.path('M277 609L269 743H317L339 624 M421 624L452 743H500L475 607Z','#fff1df');a.path('M414 519L447 404Q443 327 519 326Q590 323 592 383Q591 427 535 438L516 569Z','#fff1df');a.path('M493 343L513 262L543 339Z','#f2cf7f');a.path('M468 363Q422 357 416 407Q395 457 417 513L446 480Q427 445 468 413Z','#c8a7da');a.path('M527 329L558 287L572 354Z','#fff1df');a.ellipse(564,400,34,24,'#eed8d2');a.fixed(547,367,7);a.line('M551 418Q570 429 585 414');a.path('M268 720H315V744H265Z','#cbb0d4');a.path('M447 720H493L502 744H452Z','#cbb0d4');a.flower(130,730,1.6,'#f2b1c5');a.flower(594,704,1.2);a.flower(700,749,1.1,'#c4a9de')
 # Small, varied scene details make every 4x4 crop visibly distinct.
 rng=random.Random(name);detail_start=len(a.parts)
 for row in range(4):
  for col in range(4):
   x=col*200+rng.randint(35,100);y=row*200+rng.randint(40,105)
   if name=='rocket-launch':a.poly([(x,y-7),(x+3,y-2),(x+8,y),(x+2,y+3),(x,y+9),(x-3,y+2),(x-8,y),(x-2,y-3)],'#d9dff4')
   elif name=='turtle-reef':a.circle(x,y,4+row+col,'#d7f4f5')
   elif row>=2:a.path(f'M{x} {y}q-18 -23 -24 -4q3 16 24 4q19 -23 25 -4q-3 17 -25 4Z',['#8fc49c','#c2c77c','#b3c99b'][col%3])
   else:a.cloud(x,y,.18+.02*(row*4+col))
 details=a.parts[detail_start:];a.parts=a.parts[:detail_start];a.parts[1:1]=details
 if not color:a.parts=[p.replace('stroke="#d9bbf3"','stroke="#29394a"') for p in a.parts]
 return a.finish()
names=['treehouse-trail','turtle-reef','rocket-launch','sunflower-cottage','sailboat-bay','dinosaur-valley','fox-garden','unicorn-meadow']
for name in names:
 for kind,color in [('paint-studio/coloring-pages',False),('picture-remix/images',True)]:
  p=ROOT/'assets'/kind/(name+'.svg');p.parent.mkdir(parents=True,exist_ok=True);p.write_text(scene(name,color),encoding='utf-8')
print('Created 8 coloring pages and 8 full-color remix scenes')
