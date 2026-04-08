#include <iostream>
#include <vector>
#include <queue>
#include <string>
using namespace std;
int main(){
    const string C="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    int w,h; cin>>w>>h;
    vector<string> g(h);
    for(int i=0;i<h;i++) cin>>g[i];
    vector<vector<int>> d(h,vector<int>(w,-1));
    int sr=0,sc=0;
    for(int r=0;r<h;r++) for(int c=0;c<w;c++) if(g[r][c]=='S'){sr=r;sc=c;}
    d[sr][sc]=0;
    queue<pair<int,int>> q; q.push({sr,sc});
    int dr[]={0,0,1,-1},dc[]={1,-1,0,0};
    while(!q.empty()){
        auto [r,c]=q.front();q.pop();
        for(int i=0;i<4;i++){
            int nr=(r+dr[i]+h)%h,nc=(c+dc[i]+w)%w;
            if(g[nr][nc]!='#'&&d[nr][nc]==-1){d[nr][nc]=d[r][c]+1;q.push({nr,nc});}
        }
    }
    for(int r=0;r<h;r++){
        for(int c=0;c<w;c++) cout<<(g[r][c]=='#'?'#':d[r][c]==-1?'.':C[d[r][c]]);
        cout<<'\n';
    }
}
