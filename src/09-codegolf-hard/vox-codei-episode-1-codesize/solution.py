import sys
input=sys.stdin.readline
W,H=map(int,input().split())
G=[list(input().strip())for _ in[0]*H]
def nodes(g):return sum(c=='@'for r in g for c in r)
def explode(g,bx,by):
 g=[r[:]for r in g];hit=set()
 for dx,dy in(1,0),(-1,0),(0,1),(0,-1):
  x,y=bx,by
  for _ in range(3):
   x+=dx;y+=dy
   if x<0 or x>=W or y<0 or y>=H or g[y][x]=='#':break
   if g[y][x]=='@':hit.add((x,y))
 if g[by][bx]=='@':hit.add((bx,by))
 for x,y in hit:g[y][x]='.'
 return g,len(hit)
def score(g,x,y):
 _,h=explode(g,x,y);return h
plan=[]
def solve(g,bombs,turns):
 if nodes(g)==0:return True
 if bombs==0 or turns<3:return False
 cands=[]
 for y in range(H):
  for x in range(W):
   if g[y][x]!='#'and g[y][x]!='@':
    s=score(g,x,y)
    if s>0:cands.append((-s,x,y))
 cands.sort()
 for _,x,y in cands[:20]:
  ng,_=explode(g,x,y)
  plan.append((x,y))
  if solve(ng,bombs-1,turns-3):return True
  plan.pop()
 return False
while 1:
 turns,bombs=map(int,input().split())
 if not plan:
  solve(G,bombs,turns)
 if plan:
  x,y=plan.pop(0)
  print(f"{x} {y}")
  for _ in range(2):
   turns,bombs=map(int,input().split())
   print("WAIT")
 else:print("WAIT")