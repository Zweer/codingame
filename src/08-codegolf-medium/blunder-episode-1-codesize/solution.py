L,C=map(int,input().split())
G=[list(input())for _ in[0]*L]
T=[(r,c)for r in range(L)for c in range(C)if G[r][c]=='T']
r=c=0
for i in range(L):
 for j in range(C):
  if G[i][j]=='@':r,c=i,j
D={'S':(1,0),'E':(0,1),'N':(-1,0),'W':(0,-1)}
N={'S':'SOUTH','E':'EAST','N':'NORTH','W':'WEST'}
d='S';b=v=0;P=[];V=set()
while 1:
 k=(r,c,d,b,v,str(G))
 if k in V:print("LOOP");break
 V.add(k)
 h=G[r][c]
 if h in D:d=h
 if h=='B':b^=1
 if h=='I':v^=1
 if h=='T':r,c=next((a,z)for a,z in T if(a,z)!=(r,c))
 p='WNES'if v else'SENW'
 dr,dc=D[d];nr,nc=r+dr,c+dc;e=G[nr][nc]
 if e=='#'or(e=='X'and not b):
  for q in p:
   dr,dc=D[q];nr,nc=r+dr,c+dc;e=G[nr][nc]
   if e!='#'and(e!='X'or b):d=q;break
 r,c=nr,nc;P+=[N[d]]
 if G[r][c]=='X'and b:G[r][c]=' '
 if G[r][c]=='$':print("\n".join(P));break