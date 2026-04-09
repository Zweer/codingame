#include<iostream>
#include<map>
#include<vector>
#include<string>
using namespace std;string G[20][20];map<string,int>M;int L,H;long long R(){int s;cin>>s;cin.ignore();vector<string>v(s);for(int i=0;i<s;i++)getline(cin,v[i]);long long r=0;for(int i=0;i<s/H;i++){string k;for(int j=0;j<H;j++){if(j)k+="\n";k+=v[i*H+j];}r=r*20+M[k];}return r;}int main(){cin>>L>>H;cin.ignore();for(int i=0;i<H;i++){string r;getline(cin,r);for(int j=0;j<20;j++)G[j][i]=r.substr(j*L,L);}for(int i=0;i<20;i++){string k;for(int j=0;j<H;j++){if(j)k+="\n";k+=G[i][j];}M[k]=i;}long long a=R(),b=R();string o;getline(cin,o);long long r=o=="+"?a+b:o=="-"?a-b:o=="*"?a*b:a/b;vector<int>d;if(!r)d.push_back(0);else while(r){d.insert(d.begin(),r%20);r/=20;}for(int x:d){for(int j=0;j<H;j++)cout<<G[x][j]<<"\n";}}