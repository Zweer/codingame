import sys
from collections import deque
input=sys.stdin.readline
W=int(input());H=int(input())
G=[input().strip()for _ in[0]*H]
I=[[-1]*W for _ in[0]*H];S={};n=0
def f(r,c):
 global n;n+=1;q=deque([(r,c)]);I[r][c]=n;a=0
 while q:
  y,x=q.popleft();a+=1
  for dy,dx in(1,0),(-1,0),(0,1),(0,-1):
   ny,nx=y+dy,x+dx
   if 0<=ny<H and 0<=nx<W and I[ny][nx]<0 and G[ny][nx]=='O':I[ny][nx]=n;q.append((ny,nx))
 S[n]=a
for _ in[0]*int(input()):
 x,y=map(int,input().split())
 if G[y][x]!='O':print(0)
 else:
  if I[y][x]<0:f(y,x)
  print(S[I[y][x]])