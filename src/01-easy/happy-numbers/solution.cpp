#include <iostream>
#include <string>
#include <set>
using namespace std;
int dss(int n){int s=0;while(n){int d=n%10;s+=d*d;n/=10;}return s;}
int main(){
    int n; cin>>n;
    while(n--){
        string s; cin>>s;
        int x=0; for(char c:s){int d=c-'0';x+=d*d;}
        set<int> seen;
        while(x!=1&&!seen.count(x)){seen.insert(x);x=dss(x);}
        cout<<s<<(x==1?" :)":" :(")<<endl;
    }
}
