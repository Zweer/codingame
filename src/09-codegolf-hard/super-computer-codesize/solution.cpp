#include<cstdio>
#include<algorithm>
using namespace std;pair<int,int>t[100001];int main(){int n;scanf("%d",&n);for(int i=0;i<n;i++){int j,d;scanf("%d%d",&j,&d);t[i]={j+d-1,j};}sort(t,t+n);int c=0,e=-1;for(int i=0;i<n;i++)if(t[i].second>e)c++,e=t[i].first;printf("%d",c);}