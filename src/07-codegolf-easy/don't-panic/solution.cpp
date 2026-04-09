#include<cstdio>
#include<map>
using namespace std;map<int,int>e;int main(){int n,w,r,ef,ep,t,c,ne;scanf("%d%d%d%d%d%d%d%d",&n,&w,&r,&ef,&ep,&t,&c,&ne);e[ef]=ep;for(;ne--;){int f,p;scanf("%d%d",&f,&p);e[f]=p;}for(;;){int f,p;char d[9];scanf("%d%d%s",&f,&p,d);int g=e.count(f)?e[f]:p;puts(f<0||p==g||(d[0]>'N')==(p<g)?"WAIT":"BLOCK");}}