#include <iostream>
#include <string>
#include <cctype>
using namespace std;
int main(){
    int L,H;cin>>L>>H;cin.ignore();
    string T;getline(cin,T);
    string rows[30];
    for(int i=0;i<H;i++)getline(cin,rows[i]);
    for(int i=0;i<H;i++){
        for(char c:T){
            int idx=toupper(c)-'A';if(idx<0||idx>25)idx=26;
            cout<<rows[i].substr(idx*L,L);
        }
        cout<<endl;
    }
}
