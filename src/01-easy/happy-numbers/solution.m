#import <Foundation/Foundation.h>
int dss(int n){int s=0;while(n){int d=n%10;s+=d*d;n/=10;}return s;}
int main(){
    int n; scanf("%d", &n);
    while(n--){
        char s[256]; scanf("%s", s);
        int x=0; for(int i=0;s[i];i++){int d=s[i]-'0';x+=d*d;}
        NSMutableSet *seen=[NSMutableSet set];
        while(x!=1&&![seen containsObject:@(x)]){[seen addObject:@(x)];x=dss(x);}
        printf("%s %s\n",s,x==1?":)":":(");
    }
    return 0;
}
