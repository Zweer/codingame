L,C,N=map(int,input().split())
g=[int(input())for _ in[0]*N]
t=r=h=0;m={}
while r<C:
 if h in m:
  pr,pt=m[h];cl=r-pr;ce=t-pt;q=(C-r)//cl;t+=q*ce;r+=q*cl;break
 m[h]=(r,t);c=L;e=0;i=h
 for _ in[0]*N:
  if g[i]>c:break
  c-=g[i];e+=g[i];i=(i+1)%N
 t+=e;r+=1;h=i
while r<C:
 c=L;e=0;i=h
 for _ in[0]*N:
  if g[i]>c:break
  c-=g[i];e+=g[i];i=(i+1)%N
 t+=e;r+=1;h=i
print(t)