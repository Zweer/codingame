#include <iostream>
#include <algorithm>
using namespace std;
int ds(long n){int s=0;while(n>0){s+=n%10;n/=10;}return s;}
int main(){
    long r;cin>>r;
    for(long x=max(1L,r-45);x<r;x++)if(x+ds(x)==r){cout<<"YES"<<endl;return 0;}
    cout<<"NO"<<endl;
}
