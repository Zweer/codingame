import sys
input=sys.stdin.readline
NB=int(input());MB=int(input())
R=[input().strip()+'.'*50 for _ in'1234']
PL=len(R[0]);F=[]
def sim(L0,L1,L2,L3,x,sp,a):
 if a==0:sp+=1
 elif a==1:sp-=1
 if a<3:
  for i,r in enumerate([L0,L1,L2,L3]):
   if r and'0'in R[i][x:x+sp]:
    if i==0:L0=0
    elif i==1:L1=0
    elif i==2:L2=0
    else:L3=0
  x+=sp
 elif a==3:
  for i,r in enumerate([L0,L1,L2,L3]):
   if r and(R[i][x]=='0'or(x+sp<PL and R[i][x+sp]=='0')):
    if i==0:L0=0
    elif i==1:L1=0
    elif i==2:L2=0
    else:L3=0
  x+=sp
 elif a==4:
  L=[L0,L1,L2,L3]
  if L[0]:
   for i in range(4):
    if L[i]and'0'in R[i][x:x+sp]:L[i]=0
  else:
   for i in 1,2,3:
    if not L[i-1]and L[i]:
     if'0'in R[i-1][x:x+sp]or'0'in R[i][x:x+sp]:L[i-1]=L[i]=0
     else:L[i-1]=1;L[i]=0
    elif L[i-1]and L[i]:
     if'0'in R[i-1][x:x+sp]:L[i-1]=0
     if'0'in R[i][x:x+sp]:L[i]=0
  L0,L1,L2,L3=L;x+=sp
 else:
  L=[L0,L1,L2,L3]
  if L[3]:
   for i in range(4):
    if L[i]and'0'in R[i][x:x+sp]:L[i]=0
  else:
   for i in 2,1,0:
    if not L[i+1]and L[i]:
     if'0'in R[i][x:x+sp]or'0'in R[i+1][x:x+sp]:L[i+1]=L[i]=0
     else:L[i+1]=1;L[i]=0
    elif L[i+1]and L[i]:
     if'0'in R[i+1][x:x+sp]:L[i+1]=0
     if'0'in R[i][x:x+sp]:L[i]=0
  L0,L1,L2,L3=L;x+=sp
 return L0,L1,L2,L3,x,sp
AN=['SPEED','SLOW','WAIT','JUMP','UP','DOWN']
while 1:
 if F:
  input()
  for _ in range(NB):input()
  print(F.pop(0));continue
 sp=int(input());L=[0]*4;bx=0
 for _ in range(NB):
  x,y,a=map(int,input().split())
  L[y]=a
  if a:bx=x
 # BFS: state = (L0,L1,L2,L3,x,sp,actions_tuple)
 q=[(L[0],L[1],L[2],L[3],bx,sp,())]
 best=None;bn=0
 for _ in range(30):
  if not q:break
  nq=[]
  for s in q:
   l0,l1,l2,l3,cx,cs,ca=s
   for ai in range(6):
    r0,r1,r2,r3,nx,ns=sim(l0,l1,l2,l3,cx,cs,ai)
    nb=r0+r1+r2+r3
    if nb<MB or ns<1:continue
    na=ca+(ai,)
    if nx>=PL-30:
     if best is None or nb>bn:best=na;bn=nb
     continue
    nq.append((r0,r1,r2,r3,nx,ns,na))
  nq.sort(key=lambda t:-(t[0]+t[1]+t[2]+t[3])*t[4])
  q=nq[:200]
  if best:break
 F=[AN[i]for i in best]if best else['SPEED']
 print(F.pop(0))
