RM={1:{0:2,1:2,3:2},2:{1:3,3:1},3:{0:2},4:{0:3,1:2},5:{0:1,3:2},6:{1:3,3:1},7:{0:2,1:2},8:{3:2,1:2},9:{0:2,3:2},10:{0:3},11:{0:1},12:{1:2},13:{3:2}}
RG={0:[0],1:[1],2:[2,3],3:[3,2],4:[4,5],5:[5,4],6:[6,7,8,9],7:[7,8,9,6],8:[8,9,6,7],9:[9,6,7,8],10:[10,11,12,13],11:[11,12,13,10],12:[12,13,10,11],13:[13,10,11,12]}
DX=[0,1,0,-1];DY=[-1,0,1,0];OP=[2,3,0,1]
;[W,H]=readline().split` `.map(Number);T=[];LK=[]
for(y=0;y<H;y++){r=readline().split` `.map(Number);T.push(r.map(v=>Math.abs(v)));LK.push(r.map(v=>v<0))}
EX=+readline()
function dfs(x,y,e,rot){
if(y>=H)return x==EX?[]:null
if(x<0||x>=W||y<0)return null
o=T[y][x];k=y*W+x;cs=LK[y][x]?[rot[k]??o]:RG[o]
for(c of cs){ex=(RM[c]||{})[e];if(ex==undefined)continue
nx=x+DX[ex];ny=y+DY[ex];ne=OP[ex]
p=rot[k];rot[k]=c
sub=dfs(nx,ny,ne,rot)
if(sub!=null){if(c!=o)sub.push({x,y,t:c});return sub}
if(p!=undefined)rot[k]=p;else delete rot[k]}
return null}
Q=[];EM={TOP:0,RIGHT:1,LEFT:3}
for(;;){p=readline().split` `;xi=+p[0];yi=+p[1];ent=EM[p[2]]
R=+readline();for(i=0;i<R;i++)readline()
if(!Q.length){rot={};plan=dfs(xi,yi,ent,rot)
if(plan)for({x,y,t}of plan){o=T[y][x];g=RG[o];r=g.indexOf(t)
if(r<=0)continue;if(r<=2)for(i=0;i<r;i++)Q.push(x+' '+y+' RIGHT')
else Q.push(x+' '+y+' LEFT')
T[y][x]=t}}
print(Q.length?Q.shift():'WAIT')}
