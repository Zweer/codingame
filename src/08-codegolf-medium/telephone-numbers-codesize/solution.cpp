#include<cstdio>
#include<map>
using namespace std;struct N{map<char,N>c;};int main(){int n,r=0;scanf("%d",&n);N t;for(;n--;){char s[99];scanf("%s",s);N*p=&t;for(int i=0;s[i];i++){if(!p->c.count(s[i]))r++;p=&p->c[s[i]];}}printf("%d",r);}