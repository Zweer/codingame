import sys,math
input=sys.stdin.readline
n=int(input());S=[]
for _ in range(n):x,y=map(int,input().split());S.append((x,y))
lx=rx=ly=0
for i in range(n-1):
 if S[i][1]==S[i+1][1]and S[i+1][0]-S[i][0]>=1000:lx,rx,ly=S[i][0],S[i+1][0],S[i][1];break
tx=(lx+rx)/2;G=3.711
def gy(px):
 for i in range(len(S)-1):
  if px>=S[i][0]and(px<S[i+1][0]or i==len(S)-2):
   if S[i+1][0]==S[i][0]:return S[i][1]
   return S[i][1]+(S[i+1][1]-S[i][1])*(px-S[i][0])/(S[i+1][0]-S[i][0])
 return S[-1][1]
while 1:
 X,Y,hs,vs,fu,ro,pw=map(int,input().split())
 dg=Y-gy(X);df=Y-ly;over=lx<=X<=rx;ah=abs(hs)
 blocked=0
 if not over:
  step=50 if X<lx else-50;cx=X
  for _ in range(200):
   cx+=step
   if cx<0 or cx>6999:break
   if(step>0 and cx>rx)or(step<0 and cx<lx):break
   if gy(cx)>Y-100:blocked=1;break
 tr=0;tp=4
 if dg<100 and vs<-30:tr=0;tp=4
 elif blocked and not over:
  tp=4 if vs<10 else 3
  tr=-20 if X<lx else 20
 elif not over:
  if X<lx:
   if hs<0:tr=30
   elif hs>80:tr=60
   elif hs>40:tr=30
   else:tr=-30-min(30,max(0,(lx-X)/50))
  else:
   if hs>0:tr=-30
   elif hs<-80:tr=-60
   elif hs<-40:tr=-30
   else:tr=30+min(30,max(0,(X-rx)/50))
  tp=4
 elif df<400 and ah<=25:
  tr=0;tp=4 if vs<-38 else 3 if vs<-25 else 2 if vs<-10 else 0 if vs>5 else 1
 elif over:
  tr=min(45,hs)if hs>0 else max(-45,hs)if ah>20 else(-10 if X<tx-100 else 10 if X>tx+100 else 0)
  tp=4 if vs<-35 else 4 if tr else 2 if vs>-15 else 3
 else:tr=(15 if hs>0 else-15)if ah>5 else 0;tp=4 if vs<-30 else 3
 dr=max(-90,min(90,int(tr)));dr=max(ro-15,min(ro+15,dr))
 dp=max(0,min(4,tp));dp=max(pw-1,min(pw+1,dp))
 print(dr,dp,flush=True)
