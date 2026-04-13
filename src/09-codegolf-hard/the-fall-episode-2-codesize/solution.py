import sys
input=sys.stdin.readline
RM={1:{0:2,1:2,3:2},2:{1:3,3:1},3:{0:2},4:{0:3,1:2},5:{0:1,3:2},6:{1:3,3:1},7:{0:2,1:2},8:{3:2,1:2},9:{0:2,3:2},10:{0:3},11:{0:1},12:{1:2},13:{3:2}}
RG={0:[0],1:[1],2:[2,3],3:[3,2],4:[4,5],5:[5,4],6:[6,7,8,9],7:[7,8,9,6],8:[8,9,6,7],9:[9,6,7,8],10:[10,11,12,13],11:[11,12,13,10],12:[12,13,10,11],13:[13,10,11,12]}
DX=[0,1,0,-1];DY=[-1,0,1,0];OP=[2,3,0,1]
W,H=map(int,input().split())
T=[];LK=[]
for y in range(H):
 r=list(map(int,input().split()));T.append([abs(v)for v in r]);LK.append([v<0 for v in r])
EX=int(input())
def dfs(x,y,e,rot):
 if y>=H:return[]if x==EX else None
 if x<0 or x>=W or y<0:return None
 o=T[y][x];k=y*W+x
 cs=[rot.get(k,o)]if LK[y][x]else RG[o]
 for c in cs:
  ex=RM.get(c,{}).get(e)
  if ex is None:continue
  nx,ny,ne=x+DX[ex],y+DY[ex],OP[ex]
  p=rot.get(k);rot[k]=c
  sub=dfs(nx,ny,ne,rot)
  if sub is not None:
   if c!=o:sub.append((x,y,c))
   return sub
  if p is not None:rot[k]=p
  else:rot.pop(k,None)
 return None
Q=[];EM={'TOP':0,'RIGHT':1,'LEFT':3}
while 1:
 p=input().split();xi,yi,ent=int(p[0]),int(p[1]),EM[p[2]]
 R=int(input())
 for _ in range(R):input()
 if not Q:
  plan=dfs(xi,yi,ent,{})
  if plan:
   for x,y,t in plan:
    o=T[y][x];g=RG[o];r=g.index(t)
    if r<=0:continue
    if r<=2:Q.extend([f"{x} {y} RIGHT"]*r)
    else:Q.extend([f"{x} {y} LEFT"]*(4-r))
    T[y][x]=t
 print(Q.pop(0)if Q else'WAIT',flush=True)
