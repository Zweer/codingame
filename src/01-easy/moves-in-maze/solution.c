#include <stdio.h>
#include <string.h>
int main(){
    const char *C="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    int w,h; scanf("%d %d",&w,&h);
    char g[100][101]; int d[100][100];
    memset(d,-1,sizeof(d));
    for(int i=0;i<h;i++) scanf("%s",g[i]);
    int sr=0,sc=0;
    for(int r=0;r<h;r++) for(int c=0;c<w;c++) if(g[r][c]=='S'){sr=r;sc=c;}
    d[sr][sc]=0;
    int qr[10000],qc[10000],qs=0,qe=0;
    qr[qe]=sr;qc[qe++]=sc;
    int dr[]={0,0,1,-1},dc[]={1,-1,0,0};
    while(qs<qe){
        int r=qr[qs],c=qc[qs++];
        for(int i=0;i<4;i++){
            int nr=(r+dr[i]+h)%h,nc=(c+dc[i]+w)%w;
            if(g[nr][nc]!='#'&&d[nr][nc]==-1){d[nr][nc]=d[r][c]+1;qr[qe]=nr;qc[qe++]=nc;}
        }
    }
    for(int r=0;r<h;r++){
        for(int c=0;c<w;c++) putchar(g[r][c]=='#'?'#':d[r][c]==-1?'.':C[d[r][c]]);
        putchar('\n');
    }
}
