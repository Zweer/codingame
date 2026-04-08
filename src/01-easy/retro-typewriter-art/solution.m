#import <Foundation/Foundation.h>
int main(){
    char line[100001]; fgets(line,sizeof(line),stdin);
    line[strcspn(line,"\n")]=0;
    NSString *s=[NSString stringWithUTF8String:line];
    NSDictionary *ab=@{@"sp":@" ",@"bS":@"\\",@"sQ":@"'",@"nl":@"\n"};
    NSMutableString *out=[NSMutableString new];
    for(NSString *tok in [s componentsSeparatedByString:@" "]){
        NSString *l2=tok.length>=2?[tok substringFromIndex:tok.length-2]:@"";
        NSString *ch,*num;
        if(ab[l2]){ch=ab[l2];num=[tok substringToIndex:tok.length-2];}
        else{ch=[tok substringFromIndex:tok.length-1];num=[tok substringToIndex:tok.length-1];}
        int n=num.length>0?[num intValue]:1; if(n<1)n=1;
        for(int i=0;i<n;i++)[out appendString:ch];
    }
    printf("%s\n",[out UTF8String]);
    return 0;
}
