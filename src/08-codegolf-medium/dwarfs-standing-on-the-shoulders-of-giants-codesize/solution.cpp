#include<cstdio>
#include<map>
#include<vector>
#include<set>
using namespace std;map<int,vector<int>>g;map<int,int>m;set<int>P;int f(int u){if(m[u])return m[u];int r=0;for(int v:g[u])r=max(r,f(v));return m[u]=r+1;}int main(){int n,a,b;scanf("%d",&n);for(;n--;){scanf("%d%d",&a,&b);g[a].push_back(b);P.insert(a);P.insert(b);}int r=0;for(int u:P)r=max(r,f(u));printf("%d",r);}