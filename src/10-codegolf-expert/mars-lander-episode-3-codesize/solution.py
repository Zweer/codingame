import sys,math
input=sys.stdin.readline
n=int(input());S=[]
for _ in range(n):x,y=map(int,input().split());S.append((x,y))
lz=None
for i in range(n-1):
 if S[i][1]==S[i+1][1]and S[i+1][0]-S[i][0]>=1000:lz=(S[i][0],S[i+1][0],S[i][1]);break
def gy(lx):
 for i in range(len(S)-1):
  if lx>=S[i][0]and(lx<S[i+1][0]or i==len(S)-2 and lx==S[i+1][0]):
   if S[i][0]==S[i+1][0]:return S[i][1]
   return S[i][1]+(S[i+1][1]-S[i][1])*(lx-S[i][0])/(S[i+1][0]-S[i][0])
 return S[-1][1]
while 1:
 X,Y,hs,vs,fu,ro,pw=map(int,input().split())
 tx=(lz[0]+lz[1])/2;ly=lz[2];dg=Y-gy(X);df=Y-ly
 tr=tp=0
 if dg<150 and vs<-20:tr=0;tp=4
 elif Y>300 and(abs(hs)>25 or X<lz[0]or X>lz[1]):
  if hs>60:tr=90
  elif hs<-60:tr=-90
  elif X<lz[0]and hs<10:tr=-45
  elif X>lz[1]and hs>-10:tr=45
  elif abs(hs)>20:tr=30 if hs>0 else-30
  else:tr=-10 if X<tx-100 else 10 if X>tx+100 else 0
  tp=4
 elif df<300 and lz[0]<=X<=lz[1]and abs(hs)<=25:
  tr=0;tp=4 if vs<-40 else 3 if vs<-20 else 2 if vs<-10 else 0
 else:
  tr=(10 if hs>0 else-10)if abs(hs)>5 else(-5 if X<tx-50 else 5 if X>tx+50 else 0)
  tp=4 if tr else(4 if vs<-35 else 0 if vs>-20 else 3)
 dr=max(-90,min(90,tr));dr=max(ro-15,min(ro+15,dr))
 dp=max(0,min(4,tp));dp=max(pw-1,min(pw+1,dp))
 print(dr,dp,flush=True)