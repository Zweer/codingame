import sys
W,H=map(int,input().split())
img=input().split()
D=bytearray(W*H);DC=bytearray(W*H);p=0
for i in range(0,len(img),2):
 c=1 if img[i]=='B'else 0;l=int(img[i+1])
 for _ in range(l):D[p]=c;DC[p]=c;p+=1
def px(r,c):return D[r*W+c]
def pxc(r,c):return DC[r*W+c]
sc=0
while sc<W:
 if any(px(r,sc)for r in range(H)):break
 sc+=1
ec=W-1
while ec>0:
 if any(px(r,ec)for r in range(H)):break
 ec-=1
L=[];r=0
while r<H:
 if px(r,sc):
  s=r
  while r<H and px(r,sc):r+=1
  L.append((s,r-1))
 r+=1
dbl=L[1][0]-L[0][1]-1;lw=L[0][1]-L[0][0]+1
for i in range(5):
 for r in range(L[i][0],L[i][1]+1):
  for c in range(W):D[r*W+c]=0
for r in range(L[4][0]+dbl+lw,min(H,L[4][1]+lw+dbl+1)):
 for c in range(W):D[r*W+c]=0
P='CDEFGABCDEFG'
NY=[(L[4][0]+L[4][1])/2+dbl,(L[4][0]+L[4][1])/2+dbl/2,(L[4][0]+L[4][1])/2,(L[4][0]+L[3][1])/2,(L[3][0]+L[3][1])/2,(L[3][0]+L[2][1])/2,(L[2][0]+L[2][1])/2,(L[2][0]+L[1][1])/2,(L[1][0]+L[1][1])/2,(L[1][0]+L[0][1])/2,(L[0][0]+L[0][1])/2,(L[0][0]+L[0][1])/2-dbl/2]
nv=[sum(px(r,c)for r in range(H))for c in range(W)]
notes=[];c=sc;nn=0;pv=0
while c<=ec:
 if nv[c]==nv[sc]:
  if pv and nn>0:notes[nn-1]['e']=c
  while c<=ec and nv[c]==nv[sc]:c+=1
  notes.append({'s':c});nn+=1;pv=1
 c+=1
nn-=1
for c in range(W):
 if nv[c]>dbl:
  for r in range(H):D[r*W+c]=0
res=[]
for i in range(nn):
 w=0;cy=0.0
 for c in range(notes[i]['s'],notes[i]['e']+1):
  for r in range(H):
   if px(r,c):w+=1;cy+=r
 cy/=w;sr=round(cy);sm=round((notes[i]['s']+notes[i]['e'])/2)
 tp='Q'if pxc(sr,sm)else'H'
 md=1e9;pi=0
 for j in range(12):
  d=abs(cy-NY[j])
  if d<md:md=d;pi=j
 res.append(P[pi]+tp)
print(' '.join(res))
