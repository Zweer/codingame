#include<cstdio>
#include<cstring>
int main(){char s[200];gets(s);int b[9999],n=0;for(int i=0;s[i];i++)for(int j=6;j>=0;j--)b[n++]=(s[i]>>j)&1;int f=1;for(int i=0;i<n;){int v=b[i],c=0;while(i<n&&b[i]==v)c++,i++;if(!f)printf(" ");f=0;printf(v?"0 ":"00 ");for(;c--;)printf("0");}}