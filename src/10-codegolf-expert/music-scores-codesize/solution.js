[W,H]=readline().split` `.map(Number);img=readline().split` `
D=new Uint8Array(W*H);DC=new Uint8Array(W*H);p=0
for(i=0;i<img.length;i+=2){c=img[i]=='B'?1:0;l=+img[i+1];for(j=0;j<l;j++){D[p]=c;DC[p]=c;p++}}
px=(r,c)=>D[r*W+c];pxc=(r,c)=>DC[r*W+c]
// Find staff lines
sc=0;while(sc<W){f=0;for(r=0;r<H;r++)if(px(r,sc))f=1;if(f)break;sc++}
ec=W-1;while(ec>0){f=0;for(r=0;r<H;r++)if(px(r,ec))f=1;if(f)break;ec--}
L=[];r=0;while(r<H){if(px(r,sc)){s=r;while(r<H&&px(r,sc))r++;L.push([s,r-1])}r++}
dbl=L[1][0]-L[0][1]-1;lw=L[0][1]-L[0][0]+1
// Erase staff lines
for(i=0;i<5;i++)for(r=L[i][0];r<=L[i][1];r++)for(c=0;c<W;c++)D[r*W+c]=0
// Erase 6th ledger line area
for(r=L[4][0]+dbl+lw;r<=L[4][1]+lw+dbl;r++)for(c=0;c<W;c++)if(r<H)D[r*W+c]=0
// Note Y positions (C D E F G A B C D E F G)
NY=[];P='CDEFGABCDEFG'
NY[0]=(L[4][0]+L[4][1])/2+dbl
NY[1]=(L[4][0]+L[4][1])/2+dbl/2
NY[2]=(L[4][0]+L[4][1])/2
NY[3]=(L[4][0]+L[3][1])/2
NY[4]=(L[3][0]+L[3][1])/2
NY[5]=(L[3][0]+L[2][1])/2
NY[6]=(L[2][0]+L[2][1])/2
NY[7]=(L[2][0]+L[1][1])/2
NY[8]=(L[1][0]+L[1][1])/2
NY[9]=(L[1][0]+L[0][1])/2
NY[10]=(L[0][0]+L[0][1])/2
NY[11]=(L[0][0]+L[0][1])/2-dbl/2
// Count vertical black pixels per column (after erasing lines)
nv=[];for(c=0;c<W;c++){n=0;for(r=0;r<H;r++)if(px(r,c))n++;nv[c]=n}
// Find notes by detecting gaps between vertical stems
notes=[];c=sc;nn=0;pv=0
while(c<=ec){if(nv[c]==nv[sc]){if(pv&&nn>0)notes[nn-1].e=c
while(c<=ec&&nv[c]==nv[sc])c++
notes[nn]={s:c};nn++;pv=1}c++}
nn--
// Erase vertical stems
for(c=0;c<W;c++)if(nv[c]>dbl)for(r=0;r<H;r++)D[r*W+c]=0
// Analyze each note
res=[]
for(i=0;i<nn;i++){w=0;cy=0
for(c=notes[i].s;c<=notes[i].e;c++)for(r=0;r<H;r++)if(px(r,c)){w++;cy+=r}
cy/=w;sr=Math.round(cy);sm=Math.round((notes[i].s+notes[i].e)/2)
tp=pxc(sr,sm)?'Q':'H'
md=1e9;pi=0
for(j=0;j<12;j++){d=Math.abs(cy-NY[j]);if(d<md){md=d;pi=j}}
res.push(P[pi]+tp)}
print(res.join(' '))
