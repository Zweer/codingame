import sys
from collections import deque
input=sys.stdin.readline
R,C,A=map(int,input().split())
wb=0;exp=0
while 1:
 py,px=map(int,input().split())
 G=[]
 for y in range(R):
  row=input().strip();G.append(row)
  for x in range(len(row)):
   if row[x]=='C'and x==px and y==py:wb=1
 def bfs(goal,avoid):
  q=deque([(px,py)]);vis={(px,py)};cf={}
  while q:
   x,y=q.popleft()
   for dx,dy in(1,0),(-1,0),(0,1),(0,-1):
    nx,ny=x+dx,y+dy
    if 0<=nx<C and 0<=ny<R and(nx,ny)not in vis and G[ny][nx]not in avoid:
     vis.add((nx,ny));cf[(nx,ny)]=(x,y);q.append((nx,ny))
     if G[ny][nx]==goal:return cf,(nx,ny)
  return None,None
 cf=t=None
 if not exp:
  cf,t=bfs('?','#')
  if not cf:exp=1
 if exp:
  if not wb:cf,t=bfs('C','#')
  else:cf,t=bfs('T','#')
 p=[]
 if cf:
  while t in cf:p.append(t);t=cf[t]
 nx,ny=p[-1]if p else(px,py)
 if nx>px:print("RIGHT")
 elif nx<px:print("LEFT")
 elif ny>py:print("DOWN")
 else:print("UP")
