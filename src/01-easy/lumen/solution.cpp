#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;
int main(){
    int n,l;cin>>n>>l;
    vector<vector<string>> g(n,vector<string>(n));
    for(int i=0;i<n;i++) for(int j=0;j<n;j++) cin>>g[i][j];
    int d=0;
    for(int r=0;r<n;r++) for(int c=0;c<n;c++){
        bool lit=false;
        for(int r2=0;r2<n&&!lit;r2++) for(int c2=0;c2<n&&!lit;c2++)
            if(g[r2][c2]=="C"&&max(abs(r-r2),abs(c-c2))<l) lit=true;
        if(!lit) d++;
    }
    cout<<d<<endl;
}
