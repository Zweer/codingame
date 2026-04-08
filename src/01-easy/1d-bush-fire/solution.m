#import <Foundation/Foundation.h>
int main(){
    int n; scanf("%d",&n);
    while(n--){
        char s[256]; scanf("%s",s);
        int d=0,j=0,l=(int)strlen(s);
        while(j<l){if(s[j]=='f'){d++;j+=3;}else j++;}
        printf("%d\n",d);
    }
    return 0;
}
