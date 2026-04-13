import sys
input=sys.stdin.readline
W,H=map(int,input().split())
G=[list(input().strip())for _ in range(H)]
def nodes(g):return sum(c=='@'for r in g for c in r)
def explode(g,bx,by):
 g=[r[:]for r in g];h=0
 if g[by][bx]=='@':g[by][bx]='.';h+=1
 for dx,dy in(1,0),(-1,0),(0,1),(0,-1):
  x,y=bx,by
  for _ in range(3):
   x+=dx;y+=dy
   if x<0 or x>=W or y<0 or y>=H or g[y][x]=='#':break
   if g[y][x]=='@':g[y][x]='.';h+=1
 return g,h
plan=[]
def solve(g,bombs,turns):
 if nodes(g)==0:return True
 if bombs==0 or turns<3:return False
 cands=[]
 for y in range(H):
  for x in range(W):
   if g[y][x]!='#'and g[y][x]!='@':
    _,h=explode(g,x,y)
    if h>0:cands.append((-h,x,y))
 cands.sort()
 for _,x,y in cands[:50]:
  ng,_=explode(g,x,y)
  plan.append((x,y))
  if solve(ng,bombs-1,turns-3):return True
  plan.pop()
 return False
pi=0
while 1:
 t,b=map(int,input().split())
 if pi>=len(plan):solve(G,b,t)
 if pi<len(plan):
  x,y=plan[pi];pi+=1
  print(f"{x} {y}",flush=True)
  for _ in range(2):
   input()
   print("WAIT",flush=True)
 else:print("WAIT",flush=True)
