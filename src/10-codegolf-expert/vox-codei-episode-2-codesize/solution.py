import sys
input=sys.stdin.readline
W,H=map(int,input().split())
wall=[[0]*W for _ in range(H)]
nodes=[];prev=[];turn=0;bombs=[]
def mv(x,y,dx,dy):
 if dx==0 and dy==0:return x,y,dx,dy
 nx,ny=x+dx,y+dy
 if nx<0 or nx>=W or ny<0 or ny>=H or wall[ny][nx]:dx,dy=-dx,-dy;nx,ny=x+dx,y+dy
 return nx,ny,dx,dy
def sim(ns,t):
 c=[(x,y,dx,dy)for x,y,dx,dy in ns]
 for _ in range(t):c=[mv(*n)for n in c]
 return c
def blast(bx,by):
 r={(bx,by)}
 for dx,dy in(0,1),(0,-1),(1,0),(-1,0):
  for i in range(1,4):
   cx,cy=bx+dx*i,by+dy*i
   if cx<0 or cx>=W or cy<0 or cy>=H or wall[cy][cx]:break
   r.add((cx,cy))
 return r
while 1:
 rl,ba=map(int,input().split())
 grid=[];cur=[]
 for y in range(H):
  row=input().strip();grid.append(row)
  for x in range(len(row)):
   if turn==0 and row[x]=='#':wall[y][x]=1
   if row[x]=='@':cur.append((x,y))
 if turn==0:nodes=[(x,y,0,0)for x,y in cur];prev=cur[:]
 elif turn==1:
  used=set();nn=[]
  for px,py in prev:
   best=-1;bd=99
   for i,(cx,cy)in enumerate(cur):
    if i in used:continue
    d=abs(cx-px)+abs(cy-py)
    if d<bd:bd=d;best=i
   if best>=0 and bd<=1:used.add(best);nn.append((cur[best][0],cur[best][1],cur[best][0]-px,cur[best][1]-py))
  for i,(x,y)in enumerate(cur):
   if i not in used:nn.append((x,y,0,0))
  nodes=nn
 else:
  um={f"{x},{y}":(x,y)for x,y in cur};nn=[]
  for x,y,dx,dy in nodes:
   nx,ny,ndx,ndy=mv(x,y,dx,dy);k=f"{nx},{ny}"
   if k in um:nn.append((nx,ny,ndx,ndy));del um[k]
  for x,y in um.values():nn.append((x,y,0,0))
  nodes=nn
 for b in bombs:b[2]-=1
 ch=1
 while ch:
  ch=0
  for i in range(len(bombs)-1,-1,-1):
   if bombs[i][2]<=0:
    cells=blast(bombs[i][0],bombs[i][1]);bombs.pop(i)
    nodes=[n for n in nodes if(n[0],n[1])not in cells]
    for b in bombs:
     if(b[0],b[1])in cells:b[2]=0
    ch=1
 if ba==0 or not nodes or turn==0:print("WAIT",flush=True);prev=cur[:];turn+=1;continue
 mw=min(rl-4,55);bw=-1;bx=by=-1;bh=0
 for w in range(mw+1):
  ab=sim(nodes,w+3);ap=sim(nodes,w)if w else None
  cs={}
  for x,y,_,_ in ab:
   for c in blast(x,y):cs[c]=cs.get(c,0)+1
  ps=set((x,y)for x,y,_,_ in ap)if ap else None
  for c,h in cs.items():
   if h<=bh:continue
   x,y=c
   if wall[y][x]:continue
   if w==0 and grid[y][x]!='.':continue
   if ps and c in ps:continue
   if any(b[0]==x and b[1]==y for b in bombs):continue
   bh=h;bw=w;bx,by=x,y
  if bh>=len(nodes):break
 if bw==0 and bh>0:bombs.append([bx,by,3]);print(f"{bx} {by}",flush=True)
 else:print("WAIT",flush=True)
 turn+=1