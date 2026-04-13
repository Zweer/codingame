#include<cstdio>
#include<cmath>
#include<algorithm>
using namespace std;int n,sx[30],sy[30],lx,rx,ly;double tx,G=3.711;
double gy(double px){for(int i=0;i<n-1;i++)if(px>=sx[i]&&(px<sx[i+1]||i==n-2))return sy[i]+(double)(sy[i+1]-sy[i])*(px-sx[i])/(sx[i+1]-sx[i]);return sy[n-1];}
int main(){scanf("%d",&n);for(int i=0;i<n;i++)scanf("%d%d",&sx[i],&sy[i]);
for(int i=0;i<n-1;i++)if(sy[i]==sy[i+1]&&sx[i+1]-sx[i]>=1000){lx=sx[i];rx=sx[i+1];ly=sy[i];break;}
tx=(lx+rx)/2.0;
for(;;){int X,Y,hs,vs,fu,ro,pw;scanf("%d%d%d%d%d%d%d",&X,&Y,&hs,&vs,&fu,&ro,&pw);
double dg=Y-gy(X),df=Y-ly;int over=X>=lx&&X<=rx,ah=abs(hs),blocked=0;
if(!over){int step=X<lx?50:-50;double cx=X;
for(int j=0;j<200;j++){cx+=step;if(cx<0||cx>6999)break;if((step>0&&cx>rx)||(step<0&&cx<lx))break;if(gy(cx)>Y-100){blocked=1;break;}}}
int tr=0,tp=4;
if(dg<100&&vs<-30){tr=0;tp=4;}
else if(blocked&&!over){tp=vs<10?4:3;tr=X<lx?-20:20;}
else if(!over){if(X<lx){if(hs<0)tr=30;else if(hs>80)tr=60;else if(hs>40)tr=30;else tr=-30-min(30,max(0,(lx-X)/50));}
else{if(hs>0)tr=-30;else if(hs<-80)tr=-60;else if(hs<-40)tr=-30;else tr=30+min(30,max(0,(X-rx)/50));}tp=4;}
else if(df<400&&ah<=25){tr=0;tp=vs<-38?4:vs<-25?3:vs<-10?2:vs>5?0:1;}
else if(over){tr=ah>20?(hs>0?min(45,hs):max(-45,hs)):(X<tx-100?-10:X>tx+100?10:0);tp=vs<-35?4:tr?4:vs>-15?2:3;}
else{tr=ah>5?(hs>0?15:-15):0;tp=vs<-30?4:3;}
int dr=max(-90,min(90,tr));dr=max(ro-15,min(ro+15,dr));
int dp=max(0,min(4,tp));dp=max(pw-1,min(pw+1,dp));
printf("%d %d\n",dr,dp);fflush(stdout);}}
