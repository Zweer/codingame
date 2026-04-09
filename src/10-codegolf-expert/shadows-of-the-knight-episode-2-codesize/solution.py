import sys
input=sys.stdin.readline
W,H=map(int,input().split());N=int(input());cx,cy=map(int,input().split())
sc=1
while(W+sc-1)//sc*((H+sc-1)//sc)>62500:sc*=2
C=[]
for y in range(0,H,sc):
 for x in range(0,W,sc):C.append((min(x+sc//2,W-1),min(y+sc//2,H-1)))
px,py=cx,cy;hist=[];ref=sc==1
def filt(c,px,py,cx,cy,h,s=1):
 r=[]
 for bx,by in c:
  dp=(bx-px)**2+(by-py)**2;dc=(bx-cx)**2+(by-cy)**2
  if h=='WARMER'and dc<dp:r.append((bx,by))
  elif h=='COLDER'and dc>dp:r.append((bx,by))
  elif h=='SAME'and(s>1 or dc==dp):r.append((bx,by))
 return r
while 1:
 h=input().strip()
 if h in('WARMER','COLDER','SAME'):
  hist.append((px,py,cx,cy,h))
  C=filt(C,px,py,cx,cy,h,sc)
  if not ref and len(C)<=3:
   s=set();exp=[]
   for sx,sy in C:
    for ny in range(sy-sc,sy+sc+1):
     for nx in range(sx-sc,sx+sc+1):
      px2,py2=max(0,min(W-1,nx)),max(0,min(H-1,ny))
      if(px2,py2)not in s:s.add((px2,py2));exp.append((px2,py2))
   for a in hist:exp=filt(exp,*a)
   C=exp;sc=1;ref=1
 px,py=cx,cy
 if len(C)<=1:
  if C:cx,cy=C[0]
 else:
  if len(C)<=80:
   best=9**9;bx,by=cx,cy
   for tx,ty in C:
    if tx==cx and ty==cy:continue
    w=c2=0
    for ax,ay in C:
     dp=(ax-cx)**2+(ay-cy)**2;dt=(ax-tx)**2+(ay-ty)**2
     if dt<dp:w+=1
     elif dt>dp:c2+=1
    s=abs(w-c2)
    if s<best:best=s;bx,by=tx,ty
   cx,cy=bx,by
  else:
   cx=round(sum(x for x,_ in C)/len(C));cy=round(sum(y for _,y in C)/len(C))
  if cx==px and cy==py and C:
   md=-1
   for x,y in C:
    d=(x-cx)**2+(y-cy)**2
    if d>md:md=d;cx,cy=x,y
 print(cx,cy,flush=True)