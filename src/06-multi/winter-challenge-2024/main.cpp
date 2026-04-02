#pragma GCC optimize("O2")
#include <bits/stdc++.h>
using namespace std;

const int DX[]={0,1,0,-1}, DY[]={-1,0,1,0}; // N E S W
const string DN[]={"N","E","S","W"};
string invDir(const string& d){if(d=="N")return"S";if(d=="E")return"W";if(d=="S")return"N";return"E";}
int dirIdx(const string& d){if(d=="N")return 0;if(d=="E")return 1;if(d=="S")return 2;return 3;}

int W,H,turn;
struct Cell{string type;int owner,id,pid,rid;string dir;};
Cell G[50][50];
bool isWall(int x,int y){return !(x>=0&&x<W&&y>=0&&y<H)||G[y][x].type=="WALL";}
bool isOrgan(const string&t){return t=="ROOT"||t=="BASIC"||t=="HARVESTER"||t=="TENTACLE"||t=="SPORER";}
bool isProt(const string&t){return t=="A"||t=="B"||t=="C"||t=="D";}
bool isFree(int x,int y){return x>=0&&x<W&&y>=0&&y<H&&!isWall(x,y)&&!isOrgan(G[y][x].type)&&!isProt(G[y][x].type);}
int protIdx(const string&t){if(t=="A")return 0;if(t=="B")return 1;if(t=="C")return 2;return 3;}
const char* PN[]={"A","B","C","D"};

int myP[4],opP[4];
int distMe[50][50],distOp[50][50];
int myOrgCount,opOrgCount;

void bfsDist(int owner, int dist[][50]){
    for(int i=0;i<H;i++)for(int j=0;j<W;j++)dist[i][j]=999;
    queue<pair<int,int>>q;
    for(int y=0;y<H;y++)for(int x=0;x<W;x++)
        if(isOrgan(G[y][x].type)&&G[y][x].owner==owner){dist[y][x]=0;q.push({x,y});}
    while(!q.empty()){
        auto[x,y]=q.front();q.pop();
        for(int d=0;d<4;d++){
            int nx=x+DX[d],ny=y+DY[d];
            if(nx<0||nx>=W||ny<0||ny>=H||isWall(nx,ny))continue;
            // Can traverse through proteins (grow onto them) but not through other organs
            if(isOrgan(G[ny][nx].type)&&G[ny][nx].owner!=owner)continue;
            if(isOrgan(G[ny][nx].type)&&G[ny][nx].owner==owner)continue; // already dist=0
            if(dist[ny][nx]>dist[y][x]+1){dist[ny][nx]=dist[y][x]+1;q.push({nx,ny});}
        }
    }
}

bool oppTentacleFacing(int x,int y){
    for(int d=0;d<4;d++){
        int ox=x+DX[d],oy=y+DY[d];
        if(ox<0||ox>=W||oy<0||oy>=H)continue;
        if(G[oy][ox].type=="TENTACLE"&&G[oy][ox].owner==0&&G[oy][ox].dir==invDir(DN[d]))return true;
    }
    return false;
}

bool myHarvesterFacing(int x,int y){
    for(int d=0;d<4;d++){
        int ox=x+DX[d],oy=y+DY[d];
        if(ox<0||ox>=W||oy<0||oy>=H)continue;
        if(G[oy][ox].type=="HARVESTER"&&G[oy][ox].owner==1&&G[oy][ox].dir==DN[(d+2)%4])return true;
    }
    return false;
}

bool oppHarvesterFacing(int x,int y){
    for(int d=0;d<4;d++){
        int ox=x+DX[d],oy=y+DY[d];
        if(ox<0||ox>=W||oy<0||oy>=H)continue;
        if(G[oy][ox].type=="HARVESTER"&&G[oy][ox].owner==0&&G[oy][ox].dir==DN[(d+2)%4])return true;
    }
    return false;
}

int main(){
    cin>>W>>H;cin.ignore();
    turn=0;
    while(true){
        turn++;
        for(int y=0;y<H;y++)for(int x=0;x<W;x++)G[y][x]={"",-1,0,0,0,"X"};
        int ec;cin>>ec;cin.ignore();
        myOrgCount=0;opOrgCount=0;
        for(int i=0;i<ec;i++){
            int x,y,ow,id,pid,rid;string tp,dr;
            cin>>x>>y>>tp>>ow>>id>>dr>>pid>>rid;cin.ignore();
            G[y][x]={tp,ow,id,pid,rid,dr};
            if(isOrgan(tp)){if(ow==1)myOrgCount++;else if(ow==0)opOrgCount++;}
        }
        cin>>myP[0]>>myP[1]>>myP[2]>>myP[3];cin.ignore();
        cin>>opP[0]>>opP[1]>>opP[2]>>opP[3];cin.ignore();
        int nAct;cin>>nAct;cin.ignore();
        // Count my harvesters per protein type
        int myHarv[4]={0,0,0,0};
        for(int y=0;y<H;y++)for(int x=0;x<W;x++){
            if(G[y][x].type=="HARVESTER"&&G[y][x].owner==1){
                int d2=-1;for(int d=0;d<4;d++)if(G[y][x].dir==DN[d])d2=d;
                if(d2>=0){int px=x+DX[d2],py=y+DY[d2];
                    if(px>=0&&px<W&&py>=0&&py<H){int pt=protIdx(G[py][px].type);if(pt>=0)myHarv[pt]++;}}
            }
        }
        bfsDist(1,distMe);bfsDist(0,distOp);

        cerr<<"=== T"<<turn<<" me="<<myOrgCount<<" op="<<opOrgCount
            <<" P["<<myP[0]<<","<<myP[1]<<","<<myP[2]<<","<<myP[3]<<"]"
            <<" opP["<<opP[0]<<","<<opP[1]<<","<<opP[2]<<","<<opP[3]<<"]"
            <<" acts="<<nAct<<" ==="<<endl;

        bool losing=myOrgCount<opOrgCount;
        bool earlyGame=turn<=8;
        bool lateGame=turn>50;

        map<int,vector<pair<int,int>>>orgs;
        vector<int> rootIds;
        set<int> seenRoots;
        for(int y=0;y<H;y++)for(int x=0;x<W;x++)
            if(isOrgan(G[y][x].type)&&G[y][x].owner==1){
                orgs[G[y][x].rid].push_back({x,y});
                if(!seenRoots.count(G[y][x].rid)){seenRoots.insert(G[y][x].rid);rootIds.push_back(G[y][x].rid);}
            }

        struct Prot{int x,y,t;};
        vector<Prot>prots;
        for(int y=0;y<H;y++)for(int x=0;x<W;x++)
            if(isProt(G[y][x].type))prots.push_back({x,y,protIdx(G[y][x].type)});

        cerr<<"Proteins on map: "<<prots.size();
        for(auto&p:prots){
            bool mh=myHarvesterFacing(p.x,p.y), oh=oppHarvesterFacing(p.x,p.y);
            cerr<<" "<<PN[p.t]<<"("<<p.x<<","<<p.y<<" dM="<<distMe[p.y][p.x]<<" dO="<<distOp[p.y][p.x];
            if(mh)cerr<<" MH";if(oh)cerr<<" OH";
            cerr<<")";
        }
        cerr<<endl;

        set<pair<int,int>>oppGrowTargets;
        for(int y=0;y<H;y++)for(int x=0;x<W;x++){
            if(!isOrgan(G[y][x].type)||G[y][x].owner!=0)continue;
            for(int d=0;d<4;d++){
                int nx=x+DX[d],ny=y+DY[d];
                if(nx>=0&&nx<W&&ny>=0&&ny<H&&!isWall(nx,ny)&&!isOrgan(G[ny][nx].type))
                    oppGrowTargets.insert({nx,ny});
            }
        }

        int usedP[4]={};
        auto canAfford=[&](int a,int b,int c,int d)->bool{
            return myP[0]-usedP[0]>=a&&myP[1]-usedP[1]>=b&&myP[2]-usedP[2]>=c&&myP[3]-usedP[3]>=d;
        };
        auto spend=[&](int a,int b,int c,int d){usedP[0]+=a;usedP[1]+=b;usedP[2]+=c;usedP[3]+=d;};
        auto remP=[&](int i)->int{return myP[i]-usedP[i];};

        set<int>acted;
        for(int a=0;a<nAct;a++){
            int rid=-1;
            for(int r:rootIds)if(!acted.count(r)){rid=r;break;}
            if(rid<0){cout<<"WAIT"<<endl;continue;}
            acted.insert(rid);

            bool noA=!canAfford(1,0,0,0);

            // A reserve: count reachable A proteins on map
            int reachableA=0;
            for(auto&p:prots)if(p.t==0&&distMe[p.y][p.x]<50)reachableA++;
            // If we're low on A and there are A proteins to eat, be conservative
            bool conserveA=remP(0)<=2&&remP(0)>0&&reachableA>0;

            // Detect resource crisis: any resource ≤1 with no harvester = danger
            bool resourceCrisis=false;
            for(int i=0;i<4;i++)if(remP(i)<=1&&myHarv[i]==0)resourceCrisis=true;

            cerr<<"--- Organism rid="<<rid<<" size="<<orgs[rid].size()
                <<" rem["<<remP(0)<<","<<remP(1)<<","<<remP(2)<<","<<remP(3)<<"]"
                <<(noA?" NO-A":"")<<(conserveA?" CONSERVE-A":"")<<" ---"<<endl;

            struct Candidate{int score;string cmd;string reason;};
            vector<Candidate>candidates;
            auto addCand=[&](int sc,const string&cmd,const string&reason){
                candidates.push_back({sc,cmd,reason});
            };

            for(auto&[ox,oy]:orgs[rid]){
                int fromId=G[oy][ox].id;
                for(int d=0;d<4;d++){
                    int nx=ox+DX[d],ny=oy+DY[d];
                    if(nx<0||nx>=W||ny<0||ny>=H)continue;
                    if(!isFree(nx,ny)&&!isProt(G[ny][nx].type))continue;
                    if(oppTentacleFacing(nx,ny))continue;

                    string pos="("+to_string(nx)+","+to_string(ny)+")";
                    bool targetIsProt=isProt(G[ny][nx].type);
                    // For non-BASIC organs, we can grow onto free cells OR protein cells
                    // (growing onto protein = absorbing it)

                    // === HARVESTER ===
                    if(canAfford(0,0,1,1)){
                        for(int d2=0;d2<4;d2++){
                            int px=nx+DX[d2],py=ny+DY[d2];
                            if(px<0||px>=W||py<0||py>=H)continue;
                            if(!isProt(G[py][px].type))continue;
                            if(myHarvesterFacing(px,py))continue;
                            int pt=protIdx(G[py][px].type);
                            // Harvester scoring: balance income across all 4 types
                            int sc=2000;
                            // Huge bonus for types we have NO harvester on
                            if(myHarv[pt]==0){
                                sc+=2000;
                                // Extra urgency if we're also low on this resource
                                if(myP[pt]<=1)sc+=1500;
                                else if(myP[pt]<=3)sc+=800;
                            } else if(myHarv[pt]==1){
                                sc+=400;
                            } else {
                                sc-=800; // already have 2+ harvesters on this type
                            }
                            // Penalize harvesting a type we're rich in
                            if(myP[pt]>=8)sc-=1000;
                            if(myP[pt]>=5&&myHarv[pt]>=1)sc-=600;
                            // Count how many types have no harvester - urgency multiplier
                            int unharvTypes=0;
                            for(int i=0;i<4;i++)if(myHarv[i]==0)unharvTypes++;
                            if(myHarv[pt]==0&&unharvTypes>=3)sc+=800; // very unbalanced
                            // Critical: if we only harvest 0-1 types, getting a 2nd type is essential
                            int harvTypes=0;
                            for(int i=0;i<4;i++)if(myHarv[i]>0)harvTypes++;
                            if(myHarv[pt]==0&&harvTypes<=1)sc+=1500; // must diversify!
                            // A is still slightly preferred early (needed for BASIC)
                            if(pt==0&&earlyGame&&myHarv[0]==0)sc+=500;
                            // CRITICAL: if ANY resource is ≤2 and unharvested, harvesting it is urgent
                            // This prevents the "burn all C/D then deadlock" pattern
                            for(int i=0;i<4;i++){
                                if(i==pt&&myHarv[i]==0&&myP[i]<=2)sc+=2000; // this harv fixes the crisis
                            }
                            int cs=distOp[py][px]-distMe[py][px];
                            if(cs>=0&&cs<=2)sc+=300;
                            if(cs<0)sc-=200;
                            if(oppHarvesterFacing(px,py))sc-=300;
                            if(noA){sc+=800;if(pt==0)sc+=1000;}
                            string cmd="GROW "+to_string(fromId)+" "+to_string(nx)+" "+to_string(ny)+" HARVESTER "+DN[d2];
                            string r="HARV "+pos+"->"+PN[pt]+"("+to_string(px)+","+to_string(py)+") need="+to_string(myP[pt])+" cs="+to_string(cs);
                            if(earlyGame)r+=" EARLY";if(noA)r+=" NO-A";
                            addCand(sc,cmd,r);
                        }

                        // === HARVESTER as expansion (no protein target, just grow) ===
                        // When we can't afford BASIC, use harvester to expand toward proteins
                        // Also allow growing ONTO proteins to absorb them!
                        if(noA&&!targetIsProt){
                            int bestDir=0;int bestDist=999;
                            for(int d2=0;d2<4;d2++){
                                int px=nx+DX[d2],py=ny+DY[d2];
                                for(auto&p:prots){
                                    if(p.t!=0)continue; // prioritize direction toward A
                                    int dp=abs(px-p.x)+abs(py-p.y);
                                    if(dp<bestDist){bestDist=dp;bestDir=d2;}
                                }
                            }
                            if(bestDist==999)for(int d2=0;d2<4;d2++){
                                int px=nx+DX[d2],py=ny+DY[d2];
                                for(auto&p:prots){int dp=abs(px-p.x)+abs(py-p.y);if(dp<bestDist){bestDist=dp;bestDir=d2;}}
                            }
                            bool nearA=false;
                            for(auto&p:prots)if(p.t==0&&abs(nx-p.x)+abs(ny-p.y)<=5)nearA=true;
                            int sc=nearA?2200:800;
                            if(remP(0)==0&&remP(1)==0)sc+=1200;
                            string cmd="GROW "+to_string(fromId)+" "+to_string(nx)+" "+to_string(ny)+" HARVESTER "+DN[bestDir];
                            string r="HARV-EXPAND "+pos+" dir="+DN[bestDir]+(nearA?" nearA":"")+" (no A)";
                            addCand(sc,cmd,r);
                        }
                        if(noA&&targetIsProt){
                            // Absorb protein by growing harvester onto it
                            int pt=protIdx(G[ny][nx].type);
                            int sc=2500;
                            if(pt==0)sc+=1500; // absorbing A is critical!
                            // Pick direction toward more proteins
                            int bestDir=0;int bestDist=999;
                            for(int d2=0;d2<4;d2++){
                                int px=nx+DX[d2],py=ny+DY[d2];
                                if(px>=0&&px<W&&py>=0&&py<H&&isProt(G[py][px].type)){
                                    bestDir=d2;bestDist=0;break;
                                }
                                for(auto&p:prots){
                                    int dp=abs(px-p.x)+abs(py-p.y);
                                    if(dp<bestDist){bestDist=dp;bestDir=d2;}
                                }
                            }
                            string cmd="GROW "+to_string(fromId)+" "+to_string(nx)+" "+to_string(ny)+" HARVESTER "+DN[bestDir];
                            string r="HARV-ABSORB "+pos+" "+PN[pt]+" (absorb for 3"+PN[pt]+")";
                            addCand(sc,cmd,r);
                        }
                        // (duplicate HARV-EXPAND removed)
                    }

                    // === TENTACLE: reactive (kill adjacent opp organ) ===
                    if(canAfford(0,1,1,0)){
                        for(int d2=0;d2<4;d2++){
                            int tx=nx+DX[d2],ty=ny+DY[d2];
                            if(tx<0||tx>=W||ty<0||ty>=H)continue;
                            if(!isOrgan(G[ty][tx].type)||G[ty][tx].owner!=0)continue;
                            int sc=4000;
                            if(G[ty][tx].type=="ROOT")sc+=3000;
                            if(losing)sc+=1000;
                            string cmd="GROW "+to_string(fromId)+" "+to_string(nx)+" "+to_string(ny)+" TENTACLE "+DN[d2];
                            string r="TENT-KILL "+pos+"->"+G[ty][tx].type+"("+to_string(tx)+","+to_string(ty)+")";
                            if(G[ty][tx].type=="ROOT")r+=" ROOT!";
                            addCand(sc,cmd,r);
                        }

                        // === TENTACLE: proactive (block opp growth) ===
                        for(int d2=0;d2<4;d2++){
                            int tx=nx+DX[d2],ty=ny+DY[d2];
                            if(tx<0||tx>=W||ty<0||ty>=H)continue;
                            if(isOrgan(G[ty][tx].type))continue;
                            if(!oppGrowTargets.count({tx,ty}))continue;
                            int sc=2000;
                            if(distOp[ty][tx]<=1)sc+=600;
                            if(distOp[ty][tx]<=2)sc+=200;
                            // Strong defense near our ROOT - check all roots
                            for(auto&[mx,my]:orgs[rid]){
                                if(G[my][mx].type!="ROOT")continue;
                                int rootDist=abs(nx-mx)+abs(ny-my);
                                if(rootDist<=2)sc+=2000; // very close to ROOT = critical
                                else if(rootDist<=4)sc+=700;
                            }
                            if(losing)sc+=500;
                            string cmd="GROW "+to_string(fromId)+" "+to_string(nx)+" "+to_string(ny)+" TENTACLE "+DN[d2];
                            string r="TENT-BLOCK "+pos+"->"+DN[d2]+" dOp="+to_string(distOp[ty][tx]);
                            addCand(sc,cmd,r);
                        }

                        // === TENTACLE as expansion when no A ===
                        if(noA&&!targetIsProt){
                            int bestDir=0;
                            for(auto&p:prots){
                                if(p.t!=0)continue;
                                int bestDp=999;
                                for(int d2=0;d2<4;d2++){
                                    int px=nx+DX[d2],py=ny+DY[d2];
                                    int dp=abs(px-p.x)+abs(py-p.y);
                                    if(dp<bestDp){bestDp=dp;bestDir=d2;}
                                }
                            }
                            bool nearA=false;
                            for(auto&p:prots)if(p.t==0&&abs(nx-p.x)+abs(ny-p.y)<=5)nearA=true;
                            int sc=nearA?2100:700;
                            if(remP(0)==0&&remP(3)==0)sc+=1200;
                            string cmd="GROW "+to_string(fromId)+" "+to_string(nx)+" "+to_string(ny)+" TENTACLE "+DN[bestDir];
                            string r="TENT-EXPAND "+pos+(nearA?" nearA":"")+" (no A)";
                            addCand(sc,cmd,r);
                        }
                        if(noA&&targetIsProt){
                            int pt=protIdx(G[ny][nx].type);
                            int sc=2400;
                            if(pt==0)sc+=1500;
                            int bestDir=0;int bestDist=999;
                            for(int d2=0;d2<4;d2++){
                                int px=nx+DX[d2],py=ny+DY[d2];
                                if(px>=0&&px<W&&py>=0&&py<H&&isOrgan(G[py][px].type)&&G[py][px].owner==0){
                                    bestDir=d2;bestDist=0;break;
                                }
                                for(auto&p:prots){
                                    int dp=abs(px-p.x)+abs(py-p.y);
                                    if(dp<bestDist){bestDist=dp;bestDir=d2;}
                                }
                            }
                            string cmd="GROW "+to_string(fromId)+" "+to_string(nx)+" "+to_string(ny)+" TENTACLE "+DN[bestDir];
                            string r="TENT-ABSORB "+pos+" "+PN[pt]+" (absorb for 3"+PN[pt]+")";
                            addCand(sc,cmd,r);
                        }
                    }

                    // === SPORER ===
                    if(canAfford(0,1,0,1)&&canAfford(1,1,1,1)){
                        for(int d2=0;d2<4;d2++){
                            int len=0;bool hasProt=false;
                            for(int r=1;r<=20;r++){
                                int sx=nx+DX[d2]*r,sy=ny+DY[d2]*r;
                                if(sx<0||sx>=W||sy<0||sy>=H)break;
                                if(!isFree(sx,sy)&&!isProt(G[sy][sx].type))break;
                                len++;
                                for(int dd=0;dd<4;dd++){
                                    int px2=sx+DX[dd],py2=sy+DY[dd];
                                    if(px2>=0&&px2<W&&py2>=0&&py2<H&&isProt(G[py2][px2].type))hasProt=true;
                                }
                            }
                            if(len>=3){
                                int sc=2200+len*30;
                                if(hasProt)sc+=600;
                                if(earlyGame&&turn<=4)sc-=400; // only penalize very early
                                if(lateGame)sc-=500;
                                // Penalize building sporers when we lack harvester diversity
                                {int ht=0;for(int i=0;i<4;i++)if(myHarv[i]>0)ht++;
                                if(ht<=1)sc-=1000;}
                                string cmd="GROW "+to_string(fromId)+" "+to_string(nx)+" "+to_string(ny)+" SPORER "+DN[d2];
                                string r="SPORER "+pos+" dir="+DN[d2]+" len="+to_string(len)+(hasProt?" PROT":"");

                                addCand(sc,cmd,r);
                            }
                        }
                    }

                    // === SPORER as expansion when no A (costs B+D) - INDEPENDENT gate ===
                    if(noA&&canAfford(0,1,0,1)&&!targetIsProt){
                        bool nearA=false;
                        for(auto&p:prots)if(p.t==0&&abs(nx-p.x)+abs(ny-p.y)<=5)nearA=true;
                        int sc=nearA?2150:750;
                        if(remP(0)==0&&remP(2)==0)sc+=1200;
                        int bestDir=0;int bestDist=999;
                        for(int d2=0;d2<4;d2++){
                            int px=nx+DX[d2],py=ny+DY[d2];
                            for(auto&p:prots){int dp=abs(px-p.x)+abs(py-p.y);if(dp<bestDist){bestDist=dp;bestDir=d2;}}
                        }
                        string cmd="GROW "+to_string(fromId)+" "+to_string(nx)+" "+to_string(ny)+" SPORER "+DN[bestDir];
                        string r="SPORER-EXPAND "+pos+(nearA?" nearA":"")+" (no A, B+D)";
                        addCand(sc,cmd,r);
                    }
                    if(noA&&canAfford(0,1,0,1)&&targetIsProt){
                        int pt=protIdx(G[ny][nx].type);
                        int sc=2450;
                        if(pt==0)sc+=1500;
                        int bestDir=0;int bestDist=999;
                        for(int d2=0;d2<4;d2++){
                            int px=nx+DX[d2],py=ny+DY[d2];
                            for(auto&p:prots){
                                int dp=abs(px-p.x)+abs(py-p.y);
                                if(dp<bestDist){bestDist=dp;bestDir=d2;}
                            }
                        }
                        string cmd="GROW "+to_string(fromId)+" "+to_string(nx)+" "+to_string(ny)+" SPORER "+DN[bestDir];
                        string r="SPORER-ABSORB "+pos+" "+PN[pt]+" (absorb for 3"+PN[pt]+")";
                        addCand(sc,cmd,r);
                    }

                    // === BASIC ===
                    if(canAfford(1,0,0,0)){
                        if(targetIsProt){
                            int pt=protIdx(G[ny][nx].type);
                            int cs=distOp[ny][nx]-distMe[ny][nx];
                            int sc=1200;
                            // Eating A when low is amazing (spend 1A, get 3A = net +2A)
                            if(pt==0&&remP(0)<=2)sc+=2000;
                            else if(pt==0&&remP(0)<=5)sc+=800;
                            // Eating any type we have 0 of is very valuable
                            if(myP[pt]==0&&myHarv[pt]==0)sc+=1500;
                            else if(myP[pt]==0)sc+=800;
                            else if(myP[pt]<=2&&myHarv[pt]==0)sc+=600;
                            // Resource balance: eat types that unlock builds
                            // If we can't build harvesters (need C+D), eating C or D is critical
                            if(!canAfford(0,0,1,1)&&(pt==2||pt==3))sc+=1000;
                            // If we can't build tentacles (need B+C), eating B or C helps
                            if(!canAfford(0,1,1,0)&&(pt==1||pt==2))sc+=800;
                            // Deny protein to opponent if they're close
                            if(cs<0&&distOp[ny][nx]<=2)sc+=500;
                            else if(cs<=1)sc+=200;
                            // Penalize eating types we're already rich in
                            if(myP[pt]>=10)sc-=800;
                            else if(myP[pt]>=5)sc-=300;
                            string cmd="GROW "+to_string(fromId)+" "+to_string(nx)+" "+to_string(ny)+" BASIC";
                            string r="BASIC-EAT "+pos+" "+PN[pt]+" have="+to_string(myP[pt])+" harv="+to_string(myHarv[pt])+" cs="+to_string(cs);
                            addCand(sc,cmd,r);
                        } else {
                            int sc=2000;
                            // When conserving A, strongly prefer eating A over expanding
                            if(conserveA)sc-=1000;
                            // When any resource is critically low, prefer harvester over expansion
                            if(resourceCrisis)sc-=500;
                            int bestProtBonus=0;
                            string bestProtInfo="";
                            for(auto&p:prots){
                                if(myHarvesterFacing(p.x,p.y))continue;
                                int dprot=abs(nx-p.x)+abs(ny-p.y);
                                int bonus=0;
                                if(dprot<=1)bonus=600; // adjacent = harvester next turn!
                                else if(dprot<=3)bonus=300-dprot*60;
                                else if(dprot<=6)bonus=100-dprot*10;
                                // Extra bonus for being adjacent to any unharvested protein (harvester next turn)
                                if(dprot<=1&&!myHarvesterFacing(p.x,p.y)){
                                    if(p.t==0)bonus+=400; // A
                                    else if(myP[p.t]<=1)bonus+=500; // scarce C/D/B
                                    else bonus+=200;
                                }
                                int cs=distOp[p.y][p.x]-distMe[p.y][p.x];
                                if(cs>=0&&cs<=2)bonus+=300;
                                if(cs<0&&cs>=-1)bonus+=150;
                                if(myP[p.t]==0)bonus+=100;
                                if(bonus>bestProtBonus){
                                    bestProtBonus=bonus;
                                    bestProtInfo=string(PN[p.t])+"("+to_string(p.x)+","+to_string(p.y)+") d="+to_string(dprot)+" cs="+to_string(cs);
                                }
                            }
                            sc+=bestProtBonus;
                            if(distOp[ny][nx]<=distMe[ny][nx]+1)sc+=100;
                            string cmd="GROW "+to_string(fromId)+" "+to_string(nx)+" "+to_string(ny)+" BASIC";
                            string r="BASIC "+pos+" protBonus="+to_string(bestProtBonus);
                            if(!bestProtInfo.empty())r+=" toward="+bestProtInfo;
                            r+=" dOp="+to_string(distOp[ny][nx]);
                            addCand(sc,cmd,r);
                        }
                    }

                    // === BASIC eating protein to get A when we have 0 A ===
                    // Special: eat ANY adjacent protein if we're stuck with 0 A
                    // This uses our LAST A to eat something that gives us 3 of another type
                    // But if the protein IS type A, it gives us 3A back = net +2A!
                    // Even non-A proteins: eating them grows our organism (1 tile) which matters
                }
            }

            // === SPORE ===
            // Only spore if we have enough A reserve (3+ after spending 1 for spore)
            if(canAfford(1,1,1,1)&&remP(0)>=2){
                for(auto&[ox,oy]:orgs[rid]){
                    if(G[oy][ox].type!="SPORER")continue;
                    int di=dirIdx(G[oy][ox].dir);
                    for(int r=2;r<=20;r++){
                        int tx=ox+DX[di]*r,ty=oy+DY[di]*r;
                        if(!isFree(tx,ty))break;
                        if(oppTentacleFacing(tx,ty))continue;
                        int sc=4500;
                        if(conserveA)sc-=2000; // don't waste A on sporing when low
                        // Penalize sporing when we lack harvester diversity
                        int harvTypes=0;
                        for(int i=0;i<4;i++)if(myHarv[i]>0)harvTypes++;
                        if(harvTypes<=1)sc-=1500; // only 0-1 types harvested = too risky to spore
                        if(resourceCrisis)sc-=2000; // don't spore when a resource is about to run out
                        int nearProts=0;
                        for(auto&p:prots){
                            int dp=abs(tx-p.x)+abs(ty-p.y);
                            if(dp<=1){sc+=600;nearProts++;}
                            else if(dp<=3){sc+=150;nearProts++;}
                        }
                        if(nearProts==0)sc-=2000;
                        sc+=min(distMe[ty][tx]*15,300);
                        if(lateGame)sc-=800;
                        string cmd="SPORE "+to_string(G[oy][ox].id)+" "+to_string(tx)+" "+to_string(ty);
                        string re="SPORE ("+to_string(ox)+","+to_string(oy)+")->"+to_string(tx)+","+to_string(ty)+" nearP="+to_string(nearProts)+" dMe="+to_string(distMe[ty][tx]);
                        addCand(sc,cmd,re);
                    }
                }
            }

            // Sort and pick best
            sort(candidates.begin(),candidates.end(),[](auto&a,auto&b){return a.score>b.score;});

            int logN=min((int)candidates.size(),5);
            for(int i=0;i<logN;i++){
                cerr<<(i==0?"  >> ":"     ")<<"["<<candidates[i].score<<"] "<<candidates[i].reason<<endl;
            }
            if(candidates.empty()){
                cerr<<"  >> NO CANDIDATES, WAIT"<<endl;
            }

            string bestCmd="WAIT";
            if(!candidates.empty())bestCmd=candidates[0].cmd;

            if(bestCmd!="WAIT"){
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
