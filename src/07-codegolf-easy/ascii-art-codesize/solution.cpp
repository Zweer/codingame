#include<iostream>
#include<string>
using namespace std;int main(){int l,h;cin>>l>>h;cin.ignore();string t;getline(cin,t);string r[99];for(int i=0;i<h;i++)getline(cin,r[i]);for(int i=0;i<h;i++){for(char c:t){int p=((c|32)>='a'&&(c|32)<='z'?(c|32)-'a':26)*l;for(int k=0;k<l;k++)cout<<r[i][p+k];}cout<<"\n";}}
