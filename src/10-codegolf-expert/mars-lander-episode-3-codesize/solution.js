n=+readline();S=[];for(i=0;i<n;i++){[x,y]=readline().split` `.map(Number);S.push([x,y])}
lx=ly=rx=0;for(i=0;i<n-1;i++)if(S[i][1]==S[i+1][1]&&S[i+1][0]-S[i][0]>=1000){lx=S[i][0];rx=S[i+1][0];ly=S[i][1];break}
tx=(lx+rx)/2;G=3.711
function gy(px){for(i=0;i<n-1;i++)if(px>=S[i][0]&&(px<S[i+1][0]||i==n-2))return S[i][1]+(S[i+1][1]-S[i][1])*(px-S[i][0])/(S[i+1][0]-S[i][0]);return S[n-1][1]}
function sim(X,Y,hs,vs,ro,pw,moves){
for(m of moves){let tr=m[0],tp=m[1]
tr=Math.max(ro-15,Math.min(ro+15,Math.max(-90,Math.min(90,tr))))
tp=Math.max(pw-1,Math.min(pw+1,Math.max(0,Math.min(4,tp))))
ro=tr;pw=tp;let rad=ro*Math.PI/180
hs+=pw*Math.sin(-rad);vs+=pw*Math.cos(rad)-G
X+=hs;Y+=vs
if(Y<=gy(X)||X<0||X>6999)return[X,Y,hs,vs,ro,pw,0]}
return[X,Y,hs,vs,ro,pw,1]}
// Phase-based controller with better terrain awareness
for(;;){[X,Y,hs,vs,fu,ro,pw]=readline().split` `.map(Number)
dg=Y-gy(X);df=Y-ly;over=X>=lx&&X<=rx;ah=Math.abs(hs)
// Check if there's terrain between us and landing zone
blocked=0
if(!over){step=X<lx?50:-50;cx=X
for(j=0;j<200;j++){cx+=step;if(cx<0||cx>6999)break
if((step>0&&cx>rx)||(step<0&&cx<lx))break
if(gy(cx)>Y-100){blocked=1;break}}}
tr=0;tp=4
if(dg<100&&vs<-30){tr=0;tp=4}
else if(blocked&&!over){
// Need to go up first to clear terrain
if(vs<10)tp=4;else tp=3
if(X<lx)tr=-20;else tr=20}
else if(!over){
// Navigate to landing zone
if(X<lx){if(hs<0)tr=30;else if(hs>80)tr=60;else if(hs>40)tr=30;else tr=-30-Math.min(30,Math.max(0,(lx-X)/50))}
else{if(hs>0)tr=-30;else if(hs<-80)tr=-60;else if(hs<-40)tr=-30;else tr=30+Math.min(30,Math.max(0,(X-rx)/50))}
tp=4}
else if(df<400&&ah<=25){
// Final landing
tr=0;tp=vs<-38?4:vs<-25?3:vs<-10?2:vs>5?0:1}
else if(over){
// Over landing zone, control descent
if(ah>20)tr=hs>0?Math.min(45,hs):Math.max(-45,hs)
else tr=X<tx-100?-10:X>tx+100?10:0
tp=vs<-35?4:tr?4:vs>-15?2:3}
else{tr=ah>5?(hs>0?15:-15):0;tp=vs<-30?4:3}
dr=Math.max(-90,Math.min(90,tr));dr=Math.max(ro-15,Math.min(ro+15,dr))
dp=Math.max(0,Math.min(4,tp));dp=Math.max(pw-1,Math.min(pw+1,dp))
print(dr+' '+dp)}
