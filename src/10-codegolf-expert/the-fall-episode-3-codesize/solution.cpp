#include<cstdio>
#include<vector>
#include<string>
#include<map>
#include<cstring>
#include<set>
using namespace std;
int W,H,EX,T[22][22],LK[22][22];
map<int,int>RM[14];
int RG[14][4],RL[14];
int DX[]={0,1,0,-1},DY[]={-1,0,1,0},OP[]={2,3,0,1};
map<int,int>rot;
struct R{int x,y,t;};
vector<R>plan;
bool dfs(int x,int y,int e){
if(y>=H)return x==EX;
if(x<0||x>=W||y<0)return 0;
int o=T[y][x],k=y*W+x;
int nc=LK[y][x]?1:RL[o];
for(int ci=0;ci<nc;ci++){
int c=LK[y][x]?(rot.count(k)?rot[k]:o):RG[o][ci];
if(!RM[c].count(e))continue;
int ex=RM[c][e],nx=x+DX[ex],ny=y+DY[ex],ne=OP[ex];
int had=rot.count(k),pv=had?rot[k]:0;rot[k]=c;
if(dfs(nx,ny,ne)){if(c!=o)plan.push_back({x,y,c});return 1;}
if(had)rot[k]=pv;else rot.erase(k);}return 0;}
int main(){
RM[1][0]=2;RM[1][1]=2;RM[1][3]=2;RM[2][1]=3;RM[2][3]=1;RM[3][0]=2;RM[4][0]=3;RM[4][1]=2;RM[5][0]=1;RM[5][3]=2;RM[6][1]=3;RM[6][3]=1;RM[7][0]=2;RM[7][1]=2;RM[8][3]=2;RM[8][1]=2;RM[9][0]=2;RM[9][3]=2;RM[10][0]=3;RM[11][0]=1;RM[12][1]=2;RM[13][3]=2;
RL[0]=1;RG[0][0]=0;RL[1]=1;RG[1][0]=1;
RL[2]=2;RG[2][0]=2;RG[2][1]=3;RL[3]=2;RG[3][0]=3;RG[3][1]=2;
RL[4]=2;RG[4][0]=4;RG[4][1]=5;RL[5]=2;RG[5][0]=5;RG[5][1]=4;
for(int i=0;i<4;i++){RL[6+i]=4;int g[]={6,7,8,9};for(int j=0;j<4;j++)RG[6+i][j]=g[(j+i)%4];}
for(int i=0;i<4;i++){RL[10+i]=4;int g[]={10,11,12,13};for(int j=0;j<4;j++)RG[10+i][j]=g[(j+i)%4];}
scanf("%d%d",&W,&H);
for(int y=0;y<H;y++)for(int x=0;x<W;x++){int v;scanf("%d",&v);T[y][x]=v<0?-v:v;LK[y][x]=v<0;}
scanf("%d",&EX);
vector<string>Q;int EM[256];EM['T']=0;EM['R']=1;EM['L']=3;
for(;;){int xi,yi;char pos[9];scanf("%d%d%s",&xi,&yi,pos);int ent=EM[(int)pos[0]];
int R;scanf("%d",&R);for(int i=0;i<R;i++){int a,b;char p[9];scanf("%d%d%s",&a,&b,p);}
if(Q.empty()){rot.clear();plan.clear();
if(dfs(xi,yi,ent))for(auto&s:plan){int o=T[s.y][s.x],r=-1;
for(int i=0;i<RL[o];i++)if(RG[o][i]==s.t){r=i;break;}
if(r<=0)continue;char buf[30];
if(r<=2)for(int i=0;i<r;i++){sprintf(buf,"%d %d RIGHT",s.x,s.y);Q.push_back(buf);}
else{sprintf(buf,"%d %d LEFT",s.x,s.y);Q.push_back(buf);}
T[s.y][s.x]=s.t;}}
if(Q.size()){puts(Q[0].c_str());Q.erase(Q.begin());}else puts("WAIT");fflush(stdout);}}
