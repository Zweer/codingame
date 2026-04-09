#include<cstdio>
#include<cstring>
char t[999],r[99][9999];int main(){int l,h;scanf("%d%d ",&l,&h);gets(t);for(int i=0;i<h;i++)gets(r[i]);for(int i=0;i<h;i++){for(int j=0;t[j];j++){int c=t[j]|32;int p=(c>='a'&&c<='z'?c-'a':26)*l;for(int k=0;k<l;k++)putchar(r[i][p+k]);}puts("");}}