#include<cstdio>
#include<cstring>
#include<cmath>
#include<cstdlib>
#include<iostream>
#include<string>
#include<sstream>
#include<vector>
using namespace std;int W,H;bool D[1500000],DC[1500000];int ls[5],le[5];float NY[12];char P[]="CDEFGABCDEFG";
int main(){cin>>W>>H;cin.ignore();string img;getline(cin,img);istringstream ss(img);string tok;int p=0;
while(ss>>tok){int c=tok[0]=='B'?1:0;ss>>tok;int l=stoi(tok);for(int i=0;i<l;i++){D[p]=c;DC[p]=c;p++;}}
int sc=0;while(sc<W){bool f=0;for(int r=0;r<H;r++)if(D[r*W+sc])f=1;if(f)break;sc++;}
int ec=W-1;while(ec>0){bool f=0;for(int r=0;r<H;r++)if(D[r*W+ec])f=1;if(f)break;ec--;}
int nl=0,r=0;while(r<H){if(D[r*W+sc]){ls[nl]=r;while(r<H&&D[r*W+sc])r++;le[nl]=r-1;nl++;}r++;}
int dbl=ls[1]-le[0]-1,lw=le[0]-ls[0]+1;
for(int i=0;i<5;i++)for(int r=ls[i];r<=le[i];r++)for(int c=0;c<W;c++)D[r*W+c]=0;
for(int r=ls[4]+dbl+lw;r<=le[4]+lw+dbl&&r<H;r++)for(int c=0;c<W;c++)D[r*W+c]=0;
NY[0]=(ls[4]+le[4])/2.0+dbl;NY[1]=(ls[4]+le[4])/2.0+dbl/2.0;NY[2]=(ls[4]+le[4])/2.0;NY[3]=(ls[4]+le[3])/2.0;NY[4]=(ls[3]+le[3])/2.0;NY[5]=(ls[3]+le[2])/2.0;NY[6]=(ls[2]+le[2])/2.0;NY[7]=(ls[2]+le[1])/2.0;NY[8]=(ls[1]+le[1])/2.0;NY[9]=(ls[1]+le[0])/2.0;NY[10]=(ls[0]+le[0])/2.0;NY[11]=(ls[0]+le[0])/2.0-dbl/2.0;
int nv[5001];for(int c=0;c<W;c++){int n=0;for(int r=0;r<H;r++)if(D[r*W+c])n++;nv[c]=n;}
struct N{int s,e;};N notes[1000];int nn=0;bool pv=0;int c=sc;
while(c<=ec){if(nv[c]==nv[sc]){if(pv&&nn>0)notes[nn-1].e=c;while(c<=ec&&nv[c]==nv[sc])c++;notes[nn].s=c;nn++;pv=1;}c++;}nn--;
for(int c=0;c<W;c++)if(nv[c]>dbl)for(int r=0;r<H;r++)D[r*W+c]=0;
for(int i=0;i<nn;i++){int w=0;float cy=0;
for(int c=notes[i].s;c<=notes[i].e;c++)for(int r=0;r<H;r++)if(D[r*W+c]){w++;cy+=r;}
cy/=w;int sr=(int)(cy+0.5),sm=(notes[i].s+notes[i].e)/2;
char tp=DC[sr*W+sm]?'Q':'H';
float md=1e9;int pi=0;for(int j=0;j<12;j++){float d=fabs(cy-NY[j]);if(d<md){md=d;pi=j;}}
if(i)printf(" ");printf("%c%c",P[pi],tp);}puts("");}
