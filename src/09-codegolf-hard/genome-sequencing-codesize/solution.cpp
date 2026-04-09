#include<iostream>
#include<vector>
#include<string>
#include<algorithm>
using namespace std;int n,O[5][5],r=9999;vector<string>S;void f(int m,int l,int c){if(m==(1<<n)-1){r=min(r,c);return;}for(int j=0;j<n;j++)if(!(m>>j&1))f(m|1<<j,j,c+S[j].size()-O[l][j]);}int main(){int N;cin>>N;vector<string>T(N);for(auto&s:T)cin>>s;for(auto&s:T){bool sub=0;for(auto&t:T)if(s!=t&&t.find(s)!=string::npos)sub=1;if(!sub)S.push_back(s);}n=S.size();if(n<2){cout<<(n?S[0].size():0);return 0;}for(int i=0;i<n;i++)for(int j=0;j<n;j++)if(i!=j)for(int k=1;k<=min(S[i].size(),S[j].size());k++)if(S[i].substr(S[i].size()-k)==S[j].substr(0,k))O[i][j]=k;for(int i=0;i<n;i++)f(1<<i,i,S[i].size());cout<<r;}