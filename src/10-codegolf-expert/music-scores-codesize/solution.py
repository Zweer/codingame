import sys
from collections import deque
input=sys.stdin.readline
W,H=map(int,input().split())
dwe=input().split()
grid=[[0]*W for _ in range(H)]
pi=0
for i in range(0,len(dwe),2):
 c=dwe[i]=='B';l=int(dwe[i+1])
 for _ in range(l):
  y,x=divmod(pi,W)
  if y<H:grid[y][x]=c
  pi+=1
bc=[sum(grid[y])for y in range(H)]
groups=[];g=[]
for y in range(H):
 if bc[y]>W*0.8:
  if not g or y==g[-1]+1:g.append(y)
  else:groups.append(g);g=[y]
 elif g:groups.append(g);g=[]
if g:groups.append(g)
groups.sort(key=lambda g:sum(g)/len(g))
best=None;bd=9e9
for i in range(len(groups)-4):
 five=groups[i:i+5]
 cs=[sum(g)/len(g)for g in five]
 sp=[cs[j+1]-cs[j]for j in range(4)]
 avg=sum(sp)/4;d=sum(abs(s-avg)for s in sp)
 if d<bd:bd=d;best=five
SL=[sum(g)/len(g)for g in best]
LT=round(sum(len(g)for g in best)/5)
LS=sum(SL[i+1]-SL[i]for i in range(4))/4
vis=[[0]*W for _ in range(H)]
notes=[]
for x in range(W):
 for y in range(H):
  if grid[y][x]and not vis[y][x]:
   q=deque([(y,x)]);px=[];mx=W;MX=-1;my=H;MY=-1
   while q:
    cy,cx=q.popleft()
    if cy<0 or cy>=H or cx<0 or cx>=W or vis[cy][cx]or not grid[cy][cx]:continue
    vis[cy][cx]=1;px.append((cy,cx))
    mx=min(mx,cx);MX=max(MX,cx);my=min(my,cy);MY=max(MY,cy)
    for dy in(-1,0,1):
     for dx in(-1,0,1):
      if dy or dx:q.append((cy+dy,cx+dx))
   if len(px)<15:continue
   yw={};
   for py,px2 in px:
    if py not in yw:yw[py]=[px2,px2]
    else:yw[py][0]=min(yw[py][0],px2);yw[py][1]=max(yw[py][1],px2)
   yc=-1;mw=-1
   for yy,(a,b)in yw.items():
    w=b-a+1
    if w>mw:mw=w;yc=yy
   ed=LS*0.6;eM=LS*1.5
   if mw<ed or mw>eM:continue
   bh=MY-my+1
   if bh<ed or MX-mx+1>W*0.5:continue
   hr=LS/2;hmy=max(0,yc-int(hr));hMy=min(H-1,yc+int(hr))
   bp=sum(1 for py,px2 in px if hmy<=py<=hMy and mx<=px2<=MX)
   tp=(MX-mx+1)*(hMy-hmy+1)
   fr=bp/tp if tp else 1
   nt='Q'if fr>0.5 else'H'
   nm=[]
   hs=LS/2
   for i,n in enumerate(['A','G','F','E','D','C','B','A','G','F','E','D','C']):
    ny=SL[4]-hs*2+hs*i
    nm.append((ny,n))
   cl=nm[0][1];md=abs(yc-nm[0][0])
   for ny,n in nm[1:]:
    d=abs(yc-ny)
    if d<md:md=d;cl=n
   notes.append((mx,cl+nt))
notes.sort()
print(' '.join(n for _,n in notes))