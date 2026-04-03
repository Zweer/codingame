#pragma GCC optimize("O2")
#include <bits/stdc++.h>
using namespace std;

// --- Constants ---
const int DX[]={0,1,0,-1}, DY[]={-1,0,1,0}; // N E S W
const string DN[]={"N","E","S","W"};
const char* PN[]={"A","B","C","D"};
string invDir(const string&d){if(d=="N")return"S";if(d=="E")return"W";if(d=="S")return"N";return"E";}
int dirIdx(const string&d){if(d=="N")return 0;if(d=="E")return 1;if(d=="S")return 2;return 3;}

// --- Grid ---
int W,H,turn;
struct Cell{string type;int owner,id,pid,rid;string dir;};
Cell G[50][50];
bool isWall(int x,int y){return !(x>=0&&x<W&&y>=0&&y<H)||G[y][x].type=="WALL";}
bool isOrgan(const string&t){return t=="ROOT"||t=="BASIC"||t=="HARVESTER"||t=="TENTACLE"||t=="SPORER";}
bool isProt(const string&t){return t=="A"||t=="B"||t=="C"||t=="D";}
bool inBounds(int x,int y){return x>=0&&x<W&&y>=0&&y<H;}
bool isFree(int x,int y){return inBounds(x,y)&&!isWall(x,y)&&!isOrgan(G[y][x].type)&&!isProt(G[y][x].type);}
bool canGrowOn(int x,int y){return inBounds(x,y)&&!isWall(x,y)&&!isOrgan(G[y][x].type);}
int protIdx(const string&t){if(t=="A")return 0;if(t=="B")return 1;if(t=="C")return 2;return 3;}

// --- State ---
int myP[4],opP[4],myHarv[4],supply[4];
int distMe[50][50],distOp[50][50];
int myOrgCount,opOrgCount;
map<int,int> descCount; // organ id -> number of descendants (for enemy)
bool shouldExpand; // true when we have B+C+D income and aren't behind
bool conserveC;    // true when C income ≤1 — don't waste C on distant defense

struct Prot{int x,y,t;};
struct Org{int x,y,id,rid;string type;};

void bfsDist(int owner,int dist[][50]){
    for(int i=0;i<H;i++)for(int j=0;j<W;j++)dist[i][j]=999;
    queue<pair<int,int>>q;
    for(int y=0;y<H;y++)for(int x=0;x<W;x++)
        if(isOrgan(G[y][x].type)&&G[y][x].owner==owner){dist[y][x]=0;q.push({x,y});}
    while(!q.empty()){
        auto[x,y]=q.front();q.pop();
        for(int d=0;d<4;d++){
            int nx=x+DX[d],ny=y+DY[d];
            if(!inBounds(nx,ny)||isWall(nx,ny))continue;
            if(isOrgan(G[ny][nx].type))continue;
            if(dist[ny][nx]>dist[y][x]+1){dist[ny][nx]=dist[y][x]+1;q.push({nx,ny});}
        }
    }
}

bool oppTentacleFacing(int x,int y){
    for(int d=0;d<4;d++){
        int ox=x+DX[d],oy=y+DY[d];
        if(!inBounds(ox,oy))continue;
        if(G[oy][ox].type=="TENTACLE"&&G[oy][ox].owner==0&&G[oy][ox].dir==invDir(DN[d]))return true;
    }
    return false;
}
bool myHarvesterFacing(int x,int y){
    for(int d=0;d<4;d++){
        int ox=x+DX[d],oy=y+DY[d];
        if(!inBounds(ox,oy))continue;
        if(G[oy][ox].type=="HARVESTER"&&G[oy][ox].owner==1&&G[oy][ox].dir==DN[(d+2)%4])return true;
    }
    return false;
}
bool oppHarvesterFacing(int x,int y){
    for(int d=0;d<4;d++){
        int ox=x+DX[d],oy=y+DY[d];
        if(!inBounds(ox,oy))continue;
        if(G[oy][ox].type=="HARVESTER"&&G[oy][ox].owner==0&&G[oy][ox].dir==DN[(d+2)%4])return true;
    }
    return false;
}

// Count descendants of each enemy organ via parent chain
void computeDescendants(){
    descCount.clear();
    map<int,int>parent; // id -> parent_id
    map<int,vector<int>>children;
    vector<int>allIds;
    for(int y=0;y<H;y++)for(int x=0;x<W;x++){
        if(!isOrgan(G[y][x].type)||G[y][x].owner!=0)continue;
        int id=G[y][x].id,pid=G[y][x].pid;
        allIds.push_back(id);
        parent[id]=pid;
        if(pid!=0&&pid!=id)children[pid].push_back(id);
        descCount[id]=0;
    }
    // Topological: count subtree sizes bottom-up via BFS from leaves
    map<int,int>childLeft;
    queue<int>leaves;
    for(int id:allIds){
        childLeft[id]=children[id].size();
        if(childLeft[id]==0)leaves.push(id);
    }
    while(!leaves.empty()){
        int id=leaves.front();leaves.pop();
        int p=parent[id];
        if(p!=0&&p!=id&&descCount.count(p)){
            descCount[p]+=descCount[id]+1;
            childLeft[p]--;
            if(childLeft[p]==0)leaves.push(p);
        }
    }
}

// --- Candidate system ---
struct Candidate{int score;string cmd;string reason;int rid;int tx,ty;};

// --- Resource tracking ---
int usedP[4];
bool canAfford(int a,int b,int c,int d){
    return myP[0]-usedP[0]>=a&&myP[1]-usedP[1]>=b&&myP[2]-usedP[2]>=c&&myP[3]-usedP[3]>=d;
}
void spend(int a,int b,int c,int d){usedP[0]+=a;usedP[1]+=b;usedP[2]+=c;usedP[3]+=d;}
int remP(int i){return myP[i]-usedP[i];}

// Occupied cells this turn (to avoid two organisms growing to same cell)
set<pair<int,int>>occupied;

// Can we place a harvester facing this protein? (is there a free adjacent cell to put it on?)
bool isHarvestable(int px,int py){
    for(int d=0;d<4;d++){
        int hx=px+DX[d],hy=py+DY[d]; // where harvester would go
        if(!inBounds(hx,hy)||isWall(hx,hy))continue;
        if(isOrgan(G[hy][hx].type))continue;
        // There's a free cell adjacent to the protein = harvestable
        return true;
    }
    return false;
}


// ============================================================
// PHASE: FIGHT - kill/block enemy organs with tentacles
// ============================================================
void phaseFight(vector<Candidate>&cands, map<int,vector<Org>>&orgs,
                set<pair<int,int>>&oppGrowTargets, bool losing){
    if(!canAfford(0,1,1,0))return;
    for(auto&[rid,organs]:orgs){
        for(auto&o:organs){
            for(int d=0;d<4;d++){
                int nx=o.x+DX[d],ny=o.y+DY[d];
                if(!canGrowOn(nx,ny)||occupied.count({nx,ny}))continue;
                if(oppTentacleFacing(nx,ny))continue;

                // Kill: tentacle facing adjacent enemy organ
                for(int d2=0;d2<4;d2++){
                    int tx=nx+DX[d2],ty=ny+DY[d2];
                    if(!inBounds(tx,ty)||!isOrgan(G[ty][tx].type)||G[ty][tx].owner!=0)continue;
                    int sc=8000;
                    // Bonus for descendants killed
                    int desc=descCount.count(G[ty][tx].id)?descCount[G[ty][tx].id]:0;
                    sc+=desc*400;
                    if(G[ty][tx].type=="ROOT")sc+=3000+desc*200;
                    if(G[ty][tx].type=="HARVESTER")sc+=800;
                    if(G[ty][tx].type=="SPORER")sc+=600;
                    if(losing)sc+=1000;
                    string cmd="GROW "+to_string(o.id)+" "+to_string(nx)+" "+to_string(ny)+" TENTACLE "+DN[d2];
                    string r="FIGHT-KILL "+G[ty][tx].type+" desc="+to_string(desc);
                    cands.push_back({sc,cmd,r,rid,nx,ny});
                }

                // Block: tentacle facing cell enemy can grow to
                // Only block when very close to our root and enemy is adjacent
                for(int d2=0;d2<4;d2++){
                    int tx=nx+DX[d2],ty=ny+DY[d2];
                    if(!inBounds(tx,ty)||isOrgan(G[ty][tx].type))continue;
                    if(!oppGrowTargets.count({tx,ty}))continue;
                    if(distOp[ty][tx]>1)continue; // only block immediate adjacent threats
                    int sc=2000;
                    // Defend near our roots
                    for(auto&m:orgs[rid])
                        if(m.type=="ROOT"&&abs(nx-m.x)+abs(ny-m.y)<=2)sc+=2000;
                    if(losing)sc+=500;
                    // Bonus if blocking near a protein (deny resource)
                    if(isProt(G[ty][tx].type))sc+=500;
                    // C-conservation: don't waste C on distant blocks
                    if(conserveC&&distOp[ty][tx]>3)sc-=3000;
                    string cmd="GROW "+to_string(o.id)+" "+to_string(nx)+" "+to_string(ny)+" TENTACLE "+DN[d2];
                    string r="FIGHT-BLOCK dOp="+to_string(distOp[ty][tx]);
                    cands.push_back({sc,cmd,r,rid,nx,ny});
                }
            }
        }
    }
}


// ============================================================
// PHASE: SPORE - build sporers and launch spores to colonize
// ============================================================
void phaseSpore(vector<Candidate>&cands, map<int,vector<Org>>&orgs,
                vector<Prot>&prots){
    // Gate: need at least 1 harvester type (SEEK runs before us, so harvesters are placed)
    int harvTypes=0;for(int i=0;i<4;i++)if(myHarv[i]>0)harvTypes++;
    if(harvTypes<1)return;

    // Count sporers globally to limit total
    map<int,int>sporerCount;
    int totalSporers=0;
    for(auto&[rid,organs]:orgs)
        for(auto&o:organs)if(o.type=="SPORER"){sporerCount[rid]++;totalSporers++;}

    // Launch existing sporers
    if(canAfford(1,1,1,1)){
        for(auto&[rid,organs]:orgs){
            for(auto&o:organs){
                if(o.type!="SPORER")continue;
                int di=dirIdx(G[o.y][o.x].dir);
                for(int rng=2;rng<=20;rng++){
                    int tx=o.x+DX[di]*rng,ty=o.y+DY[di]*rng;
                    if(!isFree(tx,ty))break;
                    // Validate entire path from sporer to target is clear
                    bool pathClear=true;
                    for(int r2=1;r2<rng;r2++){
                        int mx=o.x+DX[di]*r2,my=o.y+DY[di]*r2;
                        if(!inBounds(mx,my)||isWall(mx,my)||isOrgan(G[my][mx].type)){pathClear=false;break;}
                    }
                    if(!pathClear)break;
                    if(oppTentacleFacing(tx,ty)||occupied.count({tx,ty}))continue;
                    int sc=5500;
                    sc+=min(distMe[ty][tx]*40,800);
                    // Diminishing returns: penalize if we already have many organisms
                    int numOrgs=orgs.size();
                    if(numOrgs>=3)sc-=1000;
                    if(numOrgs>=5)sc-=1000;
                    // Boundary bonus: prefer landing near the frontier
                    int dO=distOp[ty][tx];
                    if(dO<999&&dO<=5)sc+=600;
                    else if(dO<999&&dO<=10)sc+=300;
                    int nearP=0;
                    for(auto&p:prots){
                        int dp=abs(tx-p.x)+abs(ty-p.y);
                        if(dp<=1){sc+=500-supply[p.t]*3;nearP++;}
                        else if(dp<=3){sc+=150-supply[p.t];nearP++;}
                    }
                    if(nearP==0)sc-=3000;
                    if(turn>90)sc-=2000;
                    if(!shouldExpand)sc-=2000; // focus on harvesting first
                    string cmd="SPORE "+to_string(o.id)+" "+to_string(tx)+" "+to_string(ty);
                    string reason="SPORE dist="+to_string(distMe[ty][tx])+" nearP="+to_string(nearP);
                    cands.push_back({sc,cmd,reason,rid,tx,ty});
                }
            }
        }
    }

    // Build new sporers (need B+D for sporer, then A+B+C+D to fire next turn)
    if(!canAfford(0,1,0,1))return;
    // Only build if we can plausibly fire it (have or will have ABCD)
    bool canFireSoon=canAfford(1,2,1,2); // sporer cost + spore cost
    int totalRes=remP(0)+remP(1)+remP(2)+remP(3);
    if(!canFireSoon&&totalRes<6)return;

    for(auto&[rid,organs]:orgs){
        for(auto&o:organs){
            // Max 1 sporer per organism, max 3 total
            if(sporerCount[rid]>=1||totalSporers>=3)continue;
            for(int d=0;d<4;d++){
                int nx=o.x+DX[d],ny=o.y+DY[d];
                if(!canGrowOn(nx,ny)||occupied.count({nx,ny}))continue;
                if(oppTentacleFacing(nx,ny))continue;

                for(int d2=0;d2<4;d2++){
                    int len=0;bool hasProt=false;int bestLandDist=0;
                    for(int r=1;r<=20;r++){
                        int sx=nx+DX[d2]*r,sy=ny+DY[d2]*r;
                        if(!inBounds(sx,sy)||isWall(sx,sy))break;
                        if(isOrgan(G[sy][sx].type))break;
                        len++;
                        if(r>=2&&isFree(sx,sy)){
                            bestLandDist=max(bestLandDist,distMe[sy][sx]);
                            for(int dd=0;dd<4;dd++){
                                int px=sx+DX[dd],py=sy+DY[dd];
                                if(inBounds(px,py)&&isProt(G[py][px].type))hasProt=true;
                            }
                        }
                    }
                    if(len<3)continue;
                    int sc=3500;
                    sc+=min(bestLandDist*30,600);
                    if(hasProt)sc+=800;
                    if(turn>80)sc-=1000;
                    if(canFireSoon)sc+=500;
                    if(!shouldExpand)sc-=1500; // focus on harvesting first
                    string cmd="GROW "+to_string(o.id)+" "+to_string(nx)+" "+to_string(ny)+" SPORER "+DN[d2];
                    string reason="BUILD-SPORER len="+to_string(len)+(hasProt?" PROT":"")+(canFireSoon?" READY":"");
                    cands.push_back({sc,cmd,reason,rid,nx,ny});
                }
            }
        }
    }
}


// ============================================================
// PHASE: SEEK - harvest proteins, eat proteins, expand toward them
// ============================================================
void phaseSeek(vector<Candidate>&cands, map<int,vector<Org>>&orgs,
               vector<Prot>&prots){
    for(auto&[rid,organs]:orgs){
        for(auto&o:organs){
            for(int d=0;d<4;d++){
                int nx=o.x+DX[d],ny=o.y+DY[d];
                if(!canGrowOn(nx,ny)||occupied.count({nx,ny}))continue;
                if(oppTentacleFacing(nx,ny))continue;
                bool targetIsProt=isProt(G[ny][nx].type);

                // --- HARVESTER: place facing a protein ---
                if(canAfford(0,0,1,1)){
                    // Don't grow harvester onto a protein we're already harvesting
                    if(targetIsProt&&myHarvesterFacing(nx,ny))continue;
                    for(int d2=0;d2<4;d2++){
                        int px=nx+DX[d2],py=ny+DY[d2];
                        if(!inBounds(px,py)||!isProt(G[py][px].type))continue;
                        if(myHarvesterFacing(px,py))continue;
                        int pt=protIdx(G[py][px].type);
                        int sc=5000;
                        sc+=max(0,200-supply[pt]*15);
                        if(myHarv[pt]==0)sc+=3000; // first harvester on a type
                        if(myHarv[pt]==0&&myP[pt]<=2)sc+=1000;
                        if(myHarv[pt]>=2)sc-=3000; // 3rd+ harvester on same type = bad
                        // Diversification bonus
                        int harvTypes=0;for(int i=0;i<4;i++)if(myHarv[i]>0)harvTypes++;
                        if(myHarv[pt]==0&&harvTypes<=1)sc+=1200;
                        // Competition
                        int cs=distOp[py][px]-distMe[py][px];
                        if(cs<0)sc-=400; // opponent closer
                        if(oppHarvesterFacing(px,py))sc-=500;
                        string cmd="GROW "+to_string(o.id)+" "+to_string(nx)+" "+to_string(ny)+" HARVESTER "+DN[d2];
                        string r="SEEK-HARV "+string(PN[pt])+" sup="+to_string(supply[pt])+" h="+to_string(myHarv[pt]);
                        cands.push_back({sc,cmd,r,rid,nx,ny});
                    }
                }

                // --- BASIC: eat protein (grow onto it) ---
                if(canAfford(1,0,0,0)&&targetIsProt){
                    // NEVER eat a protein our own harvester is already harvesting
                    if(myHarvesterFacing(nx,ny))continue;
                    int pt=protIdx(G[ny][nx].type);
                    int sc=4000;
                    sc+=max(0,200-supply[pt]*10);
                    if(pt==0&&remP(0)<=2)sc+=1500; // eating A when low = net +2A
                    if(myP[pt]==0&&myHarv[pt]==0)sc+=1200;
                    if(!canAfford(0,0,1,1)&&(pt==2||pt==3))sc+=800; // unlock harvester
                    if(!canAfford(0,1,1,0)&&(pt==1||pt==2))sc+=600; // unlock tentacle
                    int cs=distOp[ny][nx]-distMe[ny][nx];
                    if(cs<0&&distOp[ny][nx]<=2)sc+=500; // deny to opponent
                    if(myP[pt]>=8)sc-=800;
                    // CRITICAL: don't eat proteins we could harvest!
                    // Harvesting = +1/turn forever, eating = +3 once
                    bool couldHarvest=isHarvestable(nx,ny)&&!myHarvesterFacing(nx,ny);
                    // Exception: if we're truly stuck (0 stock on this type AND can't build harvester), eat it
                    // Also: if A=0 and no A harvester, eating A is critical (unlocks BASIC)
                    bool desperate=!canAfford(0,0,1,1)&&!canAfford(1,0,0,0);
                    bool needA=(pt==0&&myP[0]==0&&myHarv[0]==0);
                    if(couldHarvest&&!desperate&&!needA&&myHarv[pt]==0)sc-=3000;
                    else if(couldHarvest&&!desperate&&!needA&&myHarv[pt]<=1)sc-=1500;
                    else if(couldHarvest&&!desperate&&!needA)sc-=500;
                    string cmd="GROW "+to_string(o.id)+" "+to_string(nx)+" "+to_string(ny)+" BASIC";
                    string r="SEEK-EAT "+string(PN[pt])+" sup="+to_string(supply[pt])+(couldHarvest?" HARVESTABLE":"");
                    cands.push_back({sc,cmd,r,rid,nx,ny});
                }

                // --- BASIC: expand toward proteins ---
                if(canAfford(1,0,0,0)&&!targetIsProt){
                    int sc=2500;
                    // Territory: strong bonus for expanding toward boundary
                    int dM=distMe[ny][nx],dO=distOp[ny][nx];
                    if(dO<999){
                        int diff=dO-dM;
                        if(diff<=0)sc+=800;
                        else if(diff<=2)sc+=500;
                        else if(diff<=4)sc+=200;
                        if(dO<=3)sc+=400;
                        else if(dO<=6)sc+=200;
                    }
                    // Protein proximity bonus
                    int bestBonus=0;
                    for(auto&p:prots){
                        if(myHarvesterFacing(p.x,p.y))continue;
                        int dp=abs(nx-p.x)+abs(ny-p.y);
                        int bonus=0;
                        // Short range: harvester placement next turn
                        if(dp<=1){
                            bonus=600+max(0,150-supply[p.t]*10);
                            if(myHarv[p.t]==0&&canAfford(0,0,1,1))bonus+=1500;
                        } else if(dp<=3){
                            bonus=300-dp*60;
                        }
                        // Long range: if we NEED this type (0 income, 0 stock), seek it
                        if(myHarv[p.t]==0&&myP[p.t]<=1&&dp<=10){
                            int need=800-dp*60;
                            // A is critical - boost seeking A proteins
                            if(p.t==0)need+=400;
                            if(need>bonus)bonus=need;
                        }
                        if(bonus>bestBonus)bestBonus=bonus;
                    }
                    sc+=bestBonus;
                    string cmd="GROW "+to_string(o.id)+" "+to_string(nx)+" "+to_string(ny)+" BASIC";
                    string r="SEEK-EXPAND bonus="+to_string(bestBonus);
                    cands.push_back({sc,cmd,r,rid,nx,ny});
                }

                // --- No A: use other organs to expand/absorb ---
                if(!canAfford(1,0,0,0)){
                    // Never grow onto a protein our harvester is already using
                    if(targetIsProt&&myHarvesterFacing(nx,ny))continue;
                    auto noAScore=[&](int base,int nx2,int ny2)->int{
                        int sc=base;
                        if(targetIsProt){
                            int pt2=protIdx(G[ny2][nx2].type);
                            if(pt2==0)sc+=1500;
                            // Penalize destroying harvestable proteins
                            if(isHarvestable(nx2,ny2)&&!myHarvesterFacing(nx2,ny2)&&myHarv[pt2]==0)
                                sc-=2000;
                        }
                        return sc;
                    };
                    // Harvester as expansion
                    if(canAfford(0,0,1,1)){
                        int sc=noAScore(targetIsProt?3500:1500,nx,ny);
                        int bestDir=0,bestDist=999;
                        for(int d2=0;d2<4;d2++){
                            for(auto&p:prots){
                                int dp=abs((nx+DX[d2])-p.x)+abs((ny+DY[d2])-p.y);
                                if(dp<bestDist){bestDist=dp;bestDir=d2;}
                            }
                        }
                        string cmd="GROW "+to_string(o.id)+" "+to_string(nx)+" "+to_string(ny)+" HARVESTER "+DN[bestDir];
                        string r="SEEK-NOAHARV"+(targetIsProt?string(" absorb"):string(""));
                        cands.push_back({sc,cmd,r,rid,nx,ny});
                    }
                    // Tentacle as expansion
                    if(canAfford(0,1,1,0)){
                        int sc=noAScore(targetIsProt?3400:1400,nx,ny);
                        int bestDir=0,bestDist=999;
                        for(int d2=0;d2<4;d2++){
                            for(auto&p:prots){
                                int dp=abs((nx+DX[d2])-p.x)+abs((ny+DY[d2])-p.y);
                                if(dp<bestDist){bestDist=dp;bestDir=d2;}
                            }
                        }
                        string cmd="GROW "+to_string(o.id)+" "+to_string(nx)+" "+to_string(ny)+" TENTACLE "+DN[bestDir];
                        string r="SEEK-NOATENT"+(targetIsProt?string(" absorb"):string(""));
                        cands.push_back({sc,cmd,r,rid,nx,ny});
                    }
                    // Sporer as expansion
                    if(canAfford(0,1,0,1)){
                        int sc=noAScore(targetIsProt?3300:1300,nx,ny);
                        int bestDir=0,bestDist=999;
                        for(int d2=0;d2<4;d2++){
                            for(auto&p:prots){
                                int dp=abs((nx+DX[d2])-p.x)+abs((ny+DY[d2])-p.y);
                                if(dp<bestDist){bestDist=dp;bestDir=d2;}
                            }
                        }
                        string cmd="GROW "+to_string(o.id)+" "+to_string(nx)+" "+to_string(ny)+" SPORER "+DN[bestDir];
                        string r="SEEK-NOASPOR"+(targetIsProt?string(" absorb"):string(""));
                        cands.push_back({sc,cmd,r,rid,nx,ny});
                    }
                }
            }
        }
    }
}


// ============================================================
// PHASE: FILL - expand into empty space (late game territory grab)
// ============================================================
void phaseFill(vector<Candidate>&cands, map<int,vector<Org>>&orgs){
    if(!canAfford(1,0,0,0))return;
    for(auto&[rid,organs]:orgs){
        for(auto&o:organs){
            for(int d=0;d<4;d++){
                int nx=o.x+DX[d],ny=o.y+DY[d];
                if(!canGrowOn(nx,ny)||occupied.count({nx,ny}))continue;
                if(oppTentacleFacing(nx,ny))continue;
                // Never eat a protein our harvester is using
                if(isProt(G[ny][nx].type)&&myHarvesterFacing(nx,ny))continue;
                int sc=1500;
                // Strong territory bonus
                int dO=distOp[ny][nx],dM=distMe[ny][nx];
                if(dO<999){
                    int diff=dO-dM;
                    if(diff<=0)sc+=600; // contesting
                    else if(diff<=2)sc+=300;
                    if(dO<=3)sc+=300;
                }
                // Absorb blocked proteins (only if not harvestable)
                if(isProt(G[ny][nx].type)){
                    bool hvable=isHarvestable(nx,ny)&&!myHarvesterFacing(nx,ny);
                    if(hvable&&myHarv[protIdx(G[ny][nx].type)]==0)sc-=2000;
                    else{sc+=500;if(!myHarvesterFacing(nx,ny))sc+=300;}
                }
                string cmd="GROW "+to_string(o.id)+" "+to_string(nx)+" "+to_string(ny)+" BASIC";
                string r="FILL dOp="+to_string(distOp[ny][nx]);
                cands.push_back({sc,cmd,r,rid,nx,ny});
            }
        }
    }
}

// ============================================================
// MAIN
// ============================================================
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

        // Harvester income counting
        memset(myHarv,0,sizeof(myHarv));
        for(int y=0;y<H;y++)for(int x=0;x<W;x++){
            if(G[y][x].type=="HARVESTER"&&G[y][x].owner==1){
                int di=dirIdx(G[y][x].dir);
                int px=x+DX[di],py=y+DY[di];
                if(inBounds(px,py)&&isProt(G[py][px].type))
                    myHarv[protIdx(G[py][px].type)]++;
            }
        }

        // Supply = current resources + projected income (harvesters * 10 turns)
        for(int i=0;i<4;i++)supply[i]=myP[i]+myHarv[i]*10;

        // shouldExpand: expand when we have 2+ harvester types
        {int ht=0;for(int i=0;i<4;i++)if(myHarv[i]>0)ht++;
        shouldExpand=ht>=2;}
        // conserveC: if C income is 0 and stock ≤2, don't waste it on distant defense
        conserveC=myHarv[2]==0&&myP[2]<=2;

        bfsDist(1,distMe);bfsDist(0,distOp);
        computeDescendants();

        bool losing=myOrgCount<opOrgCount;

        // Build organism map
        map<int,vector<Org>>orgs;
        vector<int>rootIds;
        set<int>seenRoots;
        for(int y=0;y<H;y++)for(int x=0;x<W;x++){
            if(!isOrgan(G[y][x].type)||G[y][x].owner!=1)continue;
            int rid=G[y][x].rid;
            orgs[rid].push_back({x,y,G[y][x].id,rid,G[y][x].type});
            if(!seenRoots.count(rid)){seenRoots.insert(rid);rootIds.push_back(rid);}
        }

        // Proteins on map
        vector<Prot>prots;
        for(int y=0;y<H;y++)for(int x=0;x<W;x++)
            if(isProt(G[y][x].type))prots.push_back({x,y,protIdx(G[y][x].type)});

        // Opponent grow targets
        set<pair<int,int>>oppGrowTargets;
        for(int y=0;y<H;y++)for(int x=0;x<W;x++){
            if(!isOrgan(G[y][x].type)||G[y][x].owner!=0)continue;
            for(int d=0;d<4;d++){
                int nx=x+DX[d],ny=y+DY[d];
                if(inBounds(nx,ny)&&!isWall(nx,ny)&&!isOrgan(G[ny][nx].type))
                    oppGrowTargets.insert({nx,ny});
            }
        }

        cerr<<"=== T"<<turn<<" me="<<myOrgCount<<" op="<<opOrgCount
            <<" P["<<myP[0]<<","<<myP[1]<<","<<myP[2]<<","<<myP[3]<<"]"
            <<" S["<<supply[0]<<","<<supply[1]<<","<<supply[2]<<","<<supply[3]<<"]"
            <<" H["<<myHarv[0]<<","<<myHarv[1]<<","<<myHarv[2]<<","<<myHarv[3]<<"]"
            <<" acts="<<nAct
            <<(shouldExpand?" EXPAND":"")<<(conserveC?" CONSERVE-C":"")
            <<(losing?" LOSING":"")
            <<" ==="<<endl;

        // Dump proteins
        cerr<<"  Proteins("<<prots.size()<<"):";
        for(auto&p:prots){
            bool mh=myHarvesterFacing(p.x,p.y),oh=oppHarvesterFacing(p.x,p.y);
            bool hv=isHarvestable(p.x,p.y);
            cerr<<" "<<PN[p.t]<<"("<<p.x<<","<<p.y
                <<" dM="<<distMe[p.y][p.x]<<" dO="<<distOp[p.y][p.x];
            if(mh)cerr<<" MH";
            if(oh)cerr<<" OH";
            if(!hv)cerr<<" BLOCKED";
            cerr<<")";
        }
        cerr<<endl;

        // Dump organisms
        for(auto&[rid2,organs2]:orgs){
            cerr<<"  Org rid="<<rid2<<" size="<<organs2.size()<<" cells:";
            int sporers=0,harvs=0,tents=0,basics=0;
            for(auto&o2:organs2){
                if(o2.type=="SPORER")sporers++;
                else if(o2.type=="HARVESTER")harvs++;
                else if(o2.type=="TENTACLE")tents++;
                else basics++;
            }
            cerr<<" B="<<basics<<" H="<<harvs<<" T="<<tents<<" S="<<sporers<<endl;
        }

        memset(usedP,0,sizeof(usedP));
        occupied.clear();
        // Mark all existing organs as occupied
        for(int y=0;y<H;y++)for(int x=0;x<W;x++)
            if(isOrgan(G[y][x].type))occupied.insert({x,y});

        set<int>acted;

        // Phase-based execution: run each phase, pick best move globally,
        // assign to organism, repeat until all organisms acted
        auto runPhase=[&](const string&phaseName, auto phaseFunc) -> int {
            int assigned=0;
            while(true){
                vector<Candidate>cands;
                phaseFunc(cands);
                if(cands.empty())break;
                sort(cands.begin(),cands.end(),[](auto&a,auto&b){return a.score>b.score;});
                // Log top candidates for this phase iteration
                cerr<<"  --- "<<phaseName<<" candidates ("<<cands.size()<<" total) ---"<<endl;
                int logged=0;
                for(auto&c:cands){
                    if(logged>=5)break;
                    if(acted.count(c.rid)||occupied.count({c.tx,c.ty})){
                        // skip but don't count
                        continue;
                    }
                    cerr<<"    "<<(logged==0?">> ":"   ")<<"["<<c.score<<"] rid="<<c.rid
                        <<" ("<<c.tx<<","<<c.ty<<") "<<c.reason<<endl;
                    logged++;
                }
                // Find best candidate for an organism that hasn't acted
                bool found=false;
                for(auto&c:cands){
                    if(acted.count(c.rid)||occupied.count({c.tx,c.ty}))continue;
                    if(c.score<=0){
                        cerr<<"    (best score "<<c.score<<" <= 0, skipping phase)"<<endl;
                        break;
                    }
                    cerr<<"  ==> "<<phaseName<<" PICK ["<<c.score<<"] rid="<<c.rid<<" "<<c.cmd<<endl;
                    cout<<c.cmd<<endl;
                    acted.insert(c.rid);
                    occupied.insert({c.tx,c.ty});
                    // Spend resources
                    if(c.cmd.find("HARVESTER")!=string::npos)spend(0,0,1,1);
                    else if(c.cmd.find("TENTACLE")!=string::npos)spend(0,1,1,0);
                    else if(c.cmd.find("SPORER")!=string::npos&&c.cmd.substr(0,4)=="GROW")spend(0,1,0,1);
                    else if(c.cmd.substr(0,5)=="SPORE")spend(1,1,1,1);
                    else if(c.cmd.find("BASIC")!=string::npos)spend(1,0,0,0);
                    cerr<<"    rem["<<remP(0)<<","<<remP(1)<<","<<remP(2)<<","<<remP(3)<<"]"<<endl;
                    assigned++;
                    found=true;
                    break;
                }
                if(!found)break;
            }
            return assigned;
        };

        int totalAssigned=0;

        // Phase 1: FIGHT
        totalAssigned+=runPhase("FIGHT",[&](vector<Candidate>&c){
            phaseFight(c,orgs,oppGrowTargets,losing);
        });

        // Phase 2: SEEK (harvester + expand - before spore!)
        totalAssigned+=runPhase("SEEK",[&](vector<Candidate>&c){
            phaseSeek(c,orgs,prots);
        });

        // Phase 3: SPORE (only after organisms have sought harvesters)
        totalAssigned+=runPhase("SPORE",[&](vector<Candidate>&c){
            phaseSpore(c,orgs,prots);
        });

        // Phase 4: FILL (always run if organisms remain unacted)
        if((int)acted.size()<nAct){
            totalAssigned+=runPhase("FILL",[&](vector<Candidate>&c){
                phaseFill(c,orgs);
            });
        }

        // WAIT for any remaining organisms — but try best-negative first
        if(totalAssigned<nAct){
            // Collect all possible moves for unacted organisms across all phases
            vector<Candidate>fallback;
            phaseFight(fallback,orgs,oppGrowTargets,losing);
            phaseSpore(fallback,orgs,prots);
            phaseSeek(fallback,orgs,prots);
            phaseFill(fallback,orgs);
            sort(fallback.begin(),fallback.end(),[](auto&a,auto&b){return a.score>b.score;});
            for(auto&c:fallback){
                if(totalAssigned>=nAct)break;
                if(acted.count(c.rid)||occupied.count({c.tx,c.ty}))continue;
                cerr<<"  [FALLBACK]["<<c.score<<"] rid="<<c.rid<<" "<<c.reason<<endl;
                cout<<c.cmd<<endl;
                acted.insert(c.rid);
                occupied.insert({c.tx,c.ty});
                if(c.cmd.find("HARVESTER")!=string::npos)spend(0,0,1,1);
                else if(c.cmd.find("TENTACLE")!=string::npos)spend(0,1,1,0);
                else if(c.cmd.find("SPORER")!=string::npos&&c.cmd.substr(0,4)=="GROW")spend(0,1,0,1);
                else if(c.cmd.substr(0,5)=="SPORE")spend(1,1,1,1);
                else if(c.cmd.find("BASIC")!=string::npos)spend(1,0,0,0);
                totalAssigned++;
            }
        }
        for(int a=totalAssigned;a<nAct;a++){
            cerr<<"  [WAIT]"<<endl;
            cout<<"WAIT"<<endl;
        }
    }
}
