#include <iostream>
#include <string>
using namespace std;
int main(){
    int n; cin>>n;
    while(n--){
        string s; cin>>s;
        int d=0,j=0;
        while(j<(int)s.size()){if(s[j]=='f'){d++;j+=3;}else j++;}
        cout<<d<<endl;
    }
}
