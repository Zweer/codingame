#pragma GCC optimize("O2")
#include <bits/stdc++.h>
using namespace std;

const int DX[]={0,1,0,-1}, DY[]={-1,0,1,0}; // N E S W
const string DN[]={"N","E","S","W"};
string invDir(const string& d){if(d=="N")return"S";if(d=="E")return"W";if(d=="S")return"N";return"E";}
int dirIdx(const string& d){if(d=="N")return 0;if(d=="E")return 1;if(d=="S")return 2;return 3;}

int W,H;
struct Cell{string type;int owner,id,pid,rid;string dir;};
Cell G[50][50];
bool isWall(int x,int y){return !( x>=0&&x<W&&y>=0&&y<H)||G[y][x].type=="WALL";}
bool isOrgan(const string&t){return t=="ROOT"||t=="BASIC"||t=="HARVESTER"||t=="TENTACLE"||t=="SPORER";}
bool isProt(const string&t){return t=="A"||t=="B"||t=="C"||t=="D";}
bool isFree(int x,int y){return x>=0&&x<W&&y>=0&&y<H&&!isWall(x,y)&&!isOrgan(G[y][x].type)&&!isProt(G[y][x].type);}
bool isWalkable(int x,int y){return x>=0&&x<W&&y>=0&&y<H&&!isWall(x,y)&&!isOrgan(G[y][x].type);} // free or protein
bool isEmpty(int x,int y){return x>=0&&x<W&&y>=0&&y<H&&G[y][x].type=="";}
int protIdx(const string&t){if(t=="A")return 0;if(t=="B")return 1;if(t=="C")return 2;return 3;}

int myP[4],opP[4];

// BFS distance from all organs of a given owner
void bfsDist(int owner, int dist[][50]){
    for(int i=0;i<H;i++)for(int j=0;j<W;j++)dist[i][j]=999;
    queue<pair<int,int>>q;
    for(int y=0;y<H;y++)for(int x=0;x<W;x++)
        if(isOrgan(G[y][x].type)&&G[y][x].owner==owner){dist[y][x]=0;q.push({x,y});}
    while(!q.empty()){
        auto[x,y]=q.front();q.pop();
        for(int d=0;d<4;d++){
            int nx=x+DX[d],ny=y+DY[d];
            if(isWall(nx,ny))continue;
            if(isOrgan(G[ny][nx].type))continue; // can't walk through organs
            if(dist[ny][nx]>dist[y][x]+1){dist[ny][nx]=dist[y][x]+1;q.push({nx,ny});}
        }
    }
}

int distMe[50][50],distOp[50][50];

// Check if opponent tentacle is facing (x,y)
bool oppTentacleFacing(int x,int y){
    for(int d=0;d<4;d++){
        int ox=x+DX[d],oy=y+DY[d];
        if(ox<0||ox>=W||oy<0||oy>=H)continue;
        if(G[oy][ox].type=="TENTACLE"&&G[oy][ox].owner==0&&G[oy][ox].dir==invDir(DN[d]))return true;
    }
    return false;
}

// Check if my harvester already faces (x,y)
bool myHarvesterFacing(int x,int y){
    for(int d=0;d<4;d++){
        int ox=x+DX[d],oy=y+DY[d];
        if(ox<0||ox>=W||oy<0||oy>=H)continue;
        if(G[oy][ox].type=="HARVESTER"&&G[oy][ox].owner==1&&G[oy][ox].dir==DN[(d+2)%4])return true;
    }
    return false;
}

// Find adjacent organ of mine (belonging to rootId), return its id or -1
int adjMyOrgan(int x,int y,int rootId=-1){
    for(int d=0;d<4;d++){
        int ox=x+DX[d],oy=y+DY[d];
        if(ox<0||ox>=W||oy<0||oy>=H)continue;
        if(isOrgan(G[oy][ox].type)&&G[oy][ox].owner==1){
            if(rootId<0||G[oy][ox].rid==rootId)return G[oy][ox].id;
        }
    }
    return -1;
}

int main(){
    cin>>W>>H;cin.ignore();
    while(true){
        for(int y=0;y<H;y++)for(int x=0;x<W;x++)G[y][x]={"",- 1,0,0,0,"X"};
        int ec;cin>>ec;cin.ignore();
        for(int i=0;i<ec;i++){
            int x,y,ow,id,pid,rid;string tp,dr;
            cin>>x>>y>>tp>>ow>>id>>dr>>pid>>rid;cin.ignore();
            G[y][x]={tp,ow,id,pid,rid,dr};
        }
        cin>>myP[0]>>myP[1]>>myP[2]>>myP[3];cin.ignore();
        cin>>opP[0]>>opP[1]>>opP[2]>>opP[3];cin.ignore();
        int nAct;cin>>nAct;cin.ignore();

        bfsDist(1,distMe);bfsDist(0,distOp);

        // Collect my organisms (by rootId)
        map<int,vector<pair<int,int>>>orgs; // rootId -> list of (x,y)
        vector<int> rootIds;
        set<int> seenRoots;
        for(int y=0;y<H;y++)for(int x=0;x<W;x++)
            if(isOrgan(G[y][x].type)&&G[y][x].owner==1){
                orgs[G[y][x].rid].push_back({x,y});
                if(!seenRoots.count(G[y][x].rid)){
                    seenRoots.insert(G[y][x].rid);
                    rootIds.push_back(G[y][x].rid);
                }
            }

        // Collect proteins
        struct Prot{int x,y,t;};
        vector<Prot>prots;
        for(int y=0;y<H;y++)for(int x=0;x<W;x++)
            if(isProt(G[y][x].type))prots.push_back({x,y,protIdx(G[y][x].type)});

        // Track used proteins this turn
        int usedP[4]={};
        auto canAfford=[&](int a,int b,int c,int d)->bool{
            return myP[0]-usedP[0]>=a&&myP[1]-usedP[1]>=b&&myP[2]-usedP[2]>=c&&myP[3]-usedP[3]>=d;
        };
        auto spend=[&](int a,int b,int c,int d){usedP[0]+=a;usedP[1]+=b;usedP[2]+=c;usedP[3]+=d;};

        set<int>acted;
        for(int a=0;a<nAct;a++){
            // Pick organism that hasn't acted
            int rid=-1;
            for(int r:rootIds)if(!acted.count(r)){rid=r;break;}
            if(rid<0){cout<<"WAIT"<<endl;continue;}
            acted.insert(rid);
            cerr<<"Act "<<a<<" rid="<<rid<<" organs="<<orgs[rid].size()<<endl;

            string bestCmd="WAIT";
            int bestScore=-99999;

            auto consider=[&](int score,const string&cmd){
                if(score>bestScore){bestScore=score;bestCmd=cmd;}
            };

            // For each free cell adjacent to this organism
            for(auto&[ox,oy]:orgs[rid]){
                int fromId=G[oy][ox].id;
                for(int d=0;d<4;d++){
                    int nx=ox+DX[d],ny=oy+DY[d];
                    if(nx<0||nx>=W||ny<0||ny>=H)continue;
                    if(!isFree(nx,ny)&&!isProt(G[ny][nx].type))continue;
                    if(oppTentacleFacing(nx,ny))continue;

                    // === HARVESTER: if adjacent to unharvested protein ===
                    if(canAfford(0,0,1,1)){
                        for(int d2=0;d2<4;d2++){
                            int px=nx+DX[d2],py=ny+DY[d2];
                            if(px<0||px>=W||py<0||py>=H)continue;
                            if(!isProt(G[py][px].type))continue;
                            if(myHarvesterFacing(px,py))continue;
                            int pt=protIdx(G[py][px].type);
                            int sc=5000-distMe[ny][nx]*100;
                            if(myP[pt]<3)sc+=500; // need this protein
                            string cmd="GROW "+to_string(fromId)+" "+to_string(nx)+" "+to_string(ny)+" HARVESTER "+DN[d2];
                            consider(sc,cmd);
                        }
                    }

                    // === TENTACLE: if adjacent to opponent organ ===
                    if(canAfford(0,1,1,0)){
                        for(int d2=0;d2<4;d2++){
                            int tx=nx+DX[d2],ty=ny+DY[d2];
                            if(tx<0||tx>=W||ty<0||ty>=H)continue;
                            if(!isOrgan(G[ty][tx].type)||G[ty][tx].owner!=0)continue;
                            int sc=4000;
                            if(G[ty][tx].type=="ROOT")sc+=2000; // kill root = kill organism
                            string cmd="GROW "+to_string(fromId)+" "+to_string(nx)+" "+to_string(ny)+" TENTACLE "+DN[d2];
                            consider(sc,cmd);
                        }
                    }

                    // === SPORER: if long free line ahead ===
                    if(canAfford(0,1,0,1)){
                        for(int d2=0;d2<4;d2++){
                            int len=0;
                            for(int r=1;r<=20;r++){
                                int sx=nx+DX[d2]*r,sy=ny+DY[d2]*r;
                                if(sx<0||sx>=W||sy<0||sy>=H)break;
                                if(!isFree(sx,sy)&&!isProt(G[sy][sx].type))break;
                                len++;
                            }
                            if(len>=4&&canAfford(1,2,1,2)){ // need sporer + root
                                int sc=3000+len*50;
                                string cmd="GROW "+to_string(fromId)+" "+to_string(nx)+" "+to_string(ny)+" SPORER "+DN[d2];
                                consider(sc,cmd);
                            }
                        }
                    }

                    // === BASIC: grow toward proteins but NOT onto them ===
                    if(canAfford(1,0,0,0)){
                        // Skip if this cell IS a protein (don't eat it!)
                        if(isProt(G[ny][nx].type)){
                            // Only eat protein if we can't afford harvester and it's type A
                            // or if it's already being harvested by opponent
                            if(canAfford(0,0,1,1)){
                                // We can afford harvester, don't eat the protein
                            } else {
                                // Can't afford harvester, eat it for the 3 proteins
                                int sc=500;
                                string cmd="GROW "+to_string(fromId)+" "+to_string(nx)+" "+to_string(ny)+" BASIC";
                                consider(sc,cmd);
                            }
                        } else {
                            int sc=1000;
                            for(auto&p:prots){
                                if(myHarvesterFacing(p.x,p.y))continue;
                                int dprot=abs(nx-p.x)+abs(ny-p.y);
                                int bonus=500-dprot*30;
                                if(dprot==1)bonus+=300; // adjacent = harvester next turn
                                if(myP[p.t]<3)bonus+=100;
                                sc=max(sc,1000+bonus);
                            }
                            sc+=distOp[ny][nx]*5;
                            string cmd="GROW "+to_string(fromId)+" "+to_string(nx)+" "+to_string(ny)+" BASIC";
                            consider(sc,cmd);
                        }
                    }
                }
            }

            // === SPORE: if we have a SPORER, try to launch ROOT ===
            if(canAfford(1,1,1,1)){
                for(auto&[ox,oy]:orgs[rid]){
                    if(G[oy][ox].type!="SPORER")continue;
                    int di=dirIdx(G[oy][ox].dir);
                    // Scan along sporer direction for free cells
                    for(int r=2;r<=20;r++){
                        int tx=ox+DX[di]*r,ty=oy+DY[di]*r;
                        if(!isFree(tx,ty))break;
                        // Score: prefer cells ADJACENT to proteins (not on them)
                        int sc=6000;
                        for(auto&p:prots){
                            int dp=abs(tx-p.x)+abs(ty-p.y);
                            if(dp==1)sc+=1000; // adjacent = can harvester next turn!
                            else if(dp<=3)sc+=300-dp*50;
                        }
                        // Prefer farther from my existing organs
                        sc+=distMe[ty][tx]*10;
                        string cmd="SPORE "+to_string(G[oy][ox].id)+" "+to_string(tx)+" "+to_string(ty);
                        consider(sc,cmd);
                    }
                }
            }

            if(bestCmd!="WAIT"){
                // Deduct protein costs
                if(bestCmd.find("HARVESTER")!=string::npos)spend(0,0,1,1);
                else if(bestCmd.find("TENTACLE")!=string::npos)spend(0,1,1,0);
                else if(bestCmd.find("SPORER")!=string::npos)spend(0,1,0,1);
                else if(bestCmd.find("SPORE")!=string::npos)spend(1,1,1,1);
                else if(bestCmd.find("BASIC")!=string::npos)spend(1,0,0,0);
            }

            cout<<bestCmd<<endl;
        }
    }
}
