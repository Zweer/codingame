import sys
input=sys.stdin.readline
NB=int(input());MB=int(input())
R=[input().strip()+'.'*50 for _ in[0]*4]
PL=len(R[0]);F=[]
def sim(L,x,sp,act,road):
 L=L[:]
 if act=='SPEED':sp+=1
 elif act=='SLOW':sp-=1
 if act in('SPEED','SLOW','WAIT'):
  ns=sp if act!='JUMP'else sp
  for i in range(4):
   if L[i]and'0'in road[i][x:x+sp]:L[i]=0
  x+=sp
 elif act=='JUMP':
  for i in range(4):
   if L[i]and(road[i][x]=='0'or(x+sp<len(road[i])and road[i][x+sp]=='0')):L[i]=0
  x+=sp
 elif act=='UP':
  if L[0]:
   for i in range(4):
    if L[i]and'0'in road[i][x:x+sp]:L[i]=0
   x+=sp
  else:
   for i in range(1,4):
    if not L[i-1]and L[i]:
     if'0'in road[i-1][x:x+sp]or'0'in road[i][x:x+sp]:L[i-1]=0;L[i]=0
     else:L[i-1]=1;L[i]=0
    elif L[i-1]and L[i]:
     if'0'in road[i-1][x:x+sp]:L[i-1]=0
     if'0'in road[i][x:x+sp]:L[i]=0
   x+=sp
 elif act=='DOWN':
  if L[3]:
   for i in range(4):
    if L[i]and'0'in road[i][x:x+sp]:L[i]=0
   x+=sp
  else:
   for i in range(2,-1,-1):
    if not L[i+1]and L[i]:
     if'0'in road[i][x:x+sp]or'0'in road[i+1][x:x+sp]:L[i+1]=0;L[i]=0
     else:L[i+1]=1;L[i]=0
    elif L[i+1]and L[i]:
     if'0'in road[i+1][x:x+sp]:L[i+1]=0
     if'0'in road[i][x:x+sp]:L[i]=0
   x+=sp
 return L,x,sp
ACTS=['SPEED','JUMP','WAIT','UP','DOWN','SLOW']
while 1:
 if F:
  sp=int(input())
  for _ in[0]*NB:input()
  print(F.pop(0))
  continue
 sp=int(input());L=[0]*4;bx=0
 for _ in[0]*NB:
  x,y,a=map(int,input().split())
  L[y]=a
  if a:bx=x
 q=[(L,bx,sp,[])]
 best=None
 for _ in range(9999):
  if not q:break
  nq=[]
  for cl,cx,cs,ca in q:
   for act in ACTS:
    nl,nx,ns=sim(cl,cx,cs,act,R)
    nb=sum(nl)
    if nb<MB or ns<1:continue
    na=ca+[act]
    if nx>=PL-30:
     if best is None or nb>sum(best[0])or(nb==sum(best[0])and nx>best[1]):best=(nl,nx,ns,na)
     continue
    nq.append((nl,nx,ns,na))
  nq.sort(key=lambda t:-(sum(t[0])*t[1]+{'SPEED':.6,'UP':.5,'DOWN':.5,'WAIT':.3,'JUMP':.2,'SLOW':.1}.get(t[3][-1],0)))
  q=nq[:200]
  if best:break
 F=best[3]if best else['SPEED']
 print(F.pop(0))