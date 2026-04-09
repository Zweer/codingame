import sys
input=sys.stdin.readline
RM={0:{},1:{0:2,1:2,3:2},2:{1:3,3:1},3:{0:2},4:{0:3,1:2},5:{0:1,1:2},6:{1:3,3:1},7:{0:2,1:2},8:{3:2,1:2},9:{0:2,3:2},10:{0:3},11:{0:1},12:{1:2},13:{3:2}}
RG={0:[0],1:[1],2:[2,3],3:[3,2],4:[4,5],5:[5,4],6:[6,7,8,9],7:[7,8,9,6],8:[8,9,6,7],9:[9,6,7,8],10:[10,11,12,13],11:[11,12,13,10],12:[12,13,10,11],13:[13,10,11,12]}
DX=[0,1,0,-1];DY=[-1,0,1,0];OPP=[2,3,0,1]
W,H=map(int,input().split())
T=[];LK=[]
for y in range(H):
 row=list(map(int,input().split()))
 T.append([abs(v)for v in row]);LK.append([v<0 for v in row])
EX=int(input())
def gx(t,e):return RM.get(t,{}).get(e,-1)
def rn(f,t):
 g=RG.get(f,[]);return g.index(t)if t in g else-1
rot={}
def gt(x,y):return rot.get((x,y),T[y][x])
def dfs(x,y,e):
 if y==H:return[]
 if x<0 or x>=W or y<0:return None
 orig=T[y][x];cands=[gt(x,y)]if LK[y][x]else RG[orig]
 for c in cands:
  ex=gx(c,e)
  if ex<0:continue
  nx,ny=x+DX[ex],y+DY[ex];ne=OPP[ex]
  prev=rot.get((x,y));rot[(x,y)]=c
  sub=dfs(nx,ny,ne)
  if sub is not None:
   if c!=T[y][x]:sub.append((x,y,c))
   return sub
  if prev is not None:rot[(x,y)]=prev
  else:rot.pop((x,y),None)
 return None
Q=[]
while 1:
 p=input().split();xi,yi=int(p[0]),int(p[1]);ent={'TOP':0,'RIGHT':1,'LEFT':3}[p[2]]
 R=int(input())
 rk=set()
 for _ in[0]*R:rp=input().split();rk.add((int(rp[0]),int(rp[1])))
 if not Q:
  rot.clear();plan=dfs(xi,yi,ent)
  if plan:
   for x,y,tgt in plan:
    orig=T[y][x];r=rn(orig,tgt)
    if r<=0:continue
    d='RIGHT'if r<=2 else'LEFT';cnt=r if r<=2 else 4-r
    for _ in[0]*cnt:Q.append(f"{x} {y} {d}")
    T[y][x]=tgt
 if Q:print(Q.pop(0))
 else:print("WAIT")