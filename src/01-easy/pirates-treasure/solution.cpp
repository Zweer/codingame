#include <iostream>
#include <vector>
using namespace std;
int main(){
    int w,h; cin>>w>>h;
    vector<vector<int>> g(h,vector<int>(w));
    for(int y=0;y<h;y++) for(int x=0;x<w;x++) cin>>g[y][x];
    int dx[]={-1,-1,-1,0,0,1,1,1},dy[]={-1,0,1,-1,1,-1,0,1};
    for(int y=0;y<h;y++) for(int x=0;x<w;x++) if(!g[y][x]){
        bool ok=true;
        for(int i=0;i<8;i++){int nx=x+dx[i],ny=y+dy[i];if(nx>=0&&nx<w&&ny>=0&&ny<h&&g[ny][nx]!=1)ok=false;}
        if(ok){cout<<x<<" "<<y<<endl;return 0;}
    }
}
