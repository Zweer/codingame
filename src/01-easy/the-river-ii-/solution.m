#import <stdio.h>
int ds(long n){int s=0;while(n>0){s+=n%10;n/=10;}return s;}
int main(){
    long r;scanf("%ld",&r);
    long lo=r>45?r-45:1;
    for(long x=lo;x<r;x++)if(x+ds(x)==r){puts("YES");return 0;}
    puts("NO");
}
