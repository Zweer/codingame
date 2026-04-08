#import <Foundation/Foundation.h>
int main(){
    int w,h; scanf("%d%d",&w,&h);
    int g[50][50];
    for(int y=0;y<h;y++) for(int x=0;x<w;x++) scanf("%d",&g[y][x]);
    int dx[]={-1,-1,-1,0,0,1,1,1},dy[]={-1,0,1,-1,1,-1,0,1};
    for(int y=0;y<h;y++) for(int x=0;x<w;x++) if(!g[y][x]){
        int ok=1;for(int i=0;i<8;i++){int nx=x+dx[i],ny=y+dy[i];if(nx>=0&&nx<w&&ny>=0&&ny<h&&g[ny][nx]!=1)ok=0;}
        if(ok){printf("%d %d\n",x,y);return 0;}
    }
    return 0;
}
