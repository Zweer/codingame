#import <Foundation/Foundation.h>
#include <stdlib.h>
int main(){
    int n,l; scanf("%d%d",&n,&l);
    char g[50][50][2];
    for(int i=0;i<n;i++) for(int j=0;j<n;j++) scanf("%s",g[i][j]);
    int d=0;
    for(int r=0;r<n;r++) for(int c=0;c<n;c++){int lit=0;
        for(int r2=0;r2<n&&!lit;r2++) for(int c2=0;c2<n&&!lit;c2++){
            int dr=abs(r-r2),dc=abs(c-c2);
            if(g[r2][c2][0]=='C'&&(dr>dc?dr:dc)<l) lit=1;}
        if(!lit) d++;}
    printf("%d\n",d);return 0;
}
