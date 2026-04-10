#include<cstdio>
#include<cstring>
int main(){char s[200];fgets(s,200,stdin);int n=strlen(s);if(s[n-1]==10)s[--n]=0;int b[9999];int m=0;for(int i=0;s[i];i++)for(int j=6;j>=0;j--)b[m++]=(s[i]>>j)&1;int f=1;for(int i=0;i<m;){int v=b[i],c=0;while(i<m&&b[i]==v)c++,i++;if(!f)printf(" ");f=0;printf(v?"0 ":"00 ");for(;c--;)printf("0");}}
