import sys
input=sys.stdin.readline
RM={0:{},1:{'TOP':'BOTTOM','LEFT':'BOTTOM','RIGHT':'BOTTOM'},2:{'TOP':'RIGHT','RIGHT':'BOTTOM'},3:{'TOP':'LEFT','LEFT':'BOTTOM'},4:{'TOP':'LEFT','LEFT':'BOTTOM'},5:{'TOP':'RIGHT','RIGHT':'BOTTOM'},6:{'TOP':'RIGHT','LEFT':'BOTTOM'},7:{'TOP':'LEFT','RIGHT':'BOTTOM'},8:{'LEFT':'BOTTOM','RIGHT':'TOP'},9:{'RIGHT':'BOTTOM','LEFT':'TOP'},10:{'LEFT':'RIGHT','RIGHT':'LEFT'},11:{'TOP':'BOTTOM','BOTTOM':'TOP'},12:{'TOP':'RIGHT','RIGHT':'TOP','LEFT':'BOTTOM','BOTTOM':'LEFT'},13:{'TOP':'LEFT','LEFT':'TOP','RIGHT':'BOTTOM','BOTTOM':'RIGHT'}}
DX={'TOP':0,'BOTTOM':0,'LEFT':-1,'RIGHT':1};DY={'TOP':-1,'BOTTOM':1,'LEFT':0,'RIGHT':0}
OPP={'TOP':'BOTTOM','BOTTOM':'TOP','LEFT':'RIGHT','RIGHT':'LEFT'}
CW={'TOP':'RIGHT','RIGHT':'BOTTOM','BOTTOM':'LEFT','LEFT':'TOP'}
CCW={'TOP':'LEFT','LEFT':'BOTTOM','BOTTOM':'RIGHT','RIGHT':'TOP'}
def rot_room(rm,cw=True):
 R=CW if cw else CCW;nr={}
 for e,x in rm.items():nr[R[e]]=R[x]
 return nr
W,H=map(int,input().split())
T=[];LK=[]
for y in range(H):
 row=list(map(int,input().split()))
 T.append([abs(v)for v in row]);LK.append([v<0 for v in row])
EX=int(input())
rooms=[[dict(RM.get(T[y][x],{}))for x in range(W)]for y in range(H)]
rots={}
def gt(x,y):return rots.get((x,y),rooms[y][x])
def gx(rm,e):return rm.get(e)
def get_rotations(orig):
 r=[dict(orig)]
 for _ in range(3):r.append(rot_room(r[-1]));
 return r
def dfs(x,y,e):
 if y>=H:return[]
 if x<0 or x>=W or y<0:return None
 orig=rooms[y][x]
 if LK[y][x]:cands=[gt(x,y)]
 else:cands=get_rotations(orig)
 for c in cands:
  ex=gx(c,e)
  if not ex:continue
  nx,ny=x+DX[ex],y+DY[ex];ne=OPP[ex]
  prev=rots.get((x,y));rots[(x,y)]=c
  sub=dfs(nx,ny,ne)
  if sub is not None:
   if c!=rooms[y][x]:sub.append((x,y,c))
   return sub
  if prev is not None:rots[(x,y)]=prev
  else:rots.pop((x,y),None)
 return None
Q=[]
while 1:
 p=input().split();xi,yi=int(p[0]),int(p[1]);ent=p[2]
 R=int(input())
 for _ in range(R):input()
 if not Q:
  rots.clear();plan=dfs(xi,yi,ent)
  if plan:
   for x,y,tgt in plan:
    orig=rooms[y][x]
    r=0
    for i in range(4):
     test=dict(orig)
     for _ in range(i):test=rot_room(test)
     if test==tgt:r=i;break
    if r==0:continue
    d='RIGHT'if r<=2 else'LEFT';cnt=r if r<=2 else 4-r
    for _ in range(cnt):Q.append(f"{x} {y} {d}")
    rooms[y][x]=tgt
 if Q:print(Q.pop(0),flush=True)
 else:print("WAIT",flush=True)