#include<cstdio>
#define F(x) (x)*2*(x)-(x)
int main(){int n,t,r=0,f=0;scanf("%d",&n);for(;n--;){scanf("%d",&t);if(!f||F(t)<F(r))r=t;f=1;}printf("%d",r);}