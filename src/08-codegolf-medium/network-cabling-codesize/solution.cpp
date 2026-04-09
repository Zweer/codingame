#include<cstdio>
#include<algorithm>
using namespace std;int Y[100001];int main(){int n,x,a=2e9,b=-2e9;scanf("%d",&n);for(int i=0;i<n;i++){scanf("%d%d",&x,&Y[i]);if(x<a)a=x;if(x>b)b=x;}sort(Y,Y+n);long long s=b-a,m=Y[n/2];for(int i=0;i<n;i++)s+=abs(Y[i]-m);printf("%lld",s);}