#include<cstdio>
#include<cstring>
int main(){int w,h,n,x,y,a=0,b=0,c,d;scanf("%d%d%d%d%d",&w,&h,&n,&x,&y);c=w-1;d=h-1;for(;;){char s[9];scanf("%s",s);if(strchr(s,'U'))d=y-1;if(strchr(s,'D'))b=y+1;if(strchr(s,'L'))c=x-1;if(strchr(s,'R'))a=x+1;x=(a+c)/2;y=(b+d)/2;printf("%d %d\n",x,y);}}