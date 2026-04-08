#include <iostream>
using namespace std;
int ds(long n){int s=0;while(n>0){s+=n%10;n/=10;}return s;}
int main(){
    long r1,r2;cin>>r1>>r2;
    while(r1!=r2){if(r1<r2)r1+=ds(r1);else r2+=ds(r2);}
    cout<<r1<<endl;
}
