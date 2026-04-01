#import <Foundation/Foundation.h>
int main() {
    int n, q;
    scanf("%d %d", &n, &q); getchar();
    NSMutableDictionary *m = [NSMutableDictionary new];
    for (int i = 0; i < n; i++) {
        char buf[512]; fgets(buf, sizeof(buf), stdin);
        NSString *line = [[NSString stringWithUTF8String:buf] stringByTrimmingCharactersInSet:[NSCharacterSet newlineCharacterSet]];
        NSArray *p = [line componentsSeparatedByString:@" "];
        [m setObject:[p objectAtIndex:1] forKey:[[p objectAtIndex:0] lowercaseString]];
    }
    for (int i = 0; i < q; i++) {
        char buf[512]; fgets(buf, sizeof(buf), stdin);
        NSString *f = [[NSString stringWithUTF8String:buf] stringByTrimmingCharactersInSet:[NSCharacterSet newlineCharacterSet]];
        NSRange dot = [f rangeOfString:@"." options:NSBackwardsSearch];
        if (dot.location == NSNotFound) { puts("UNKNOWN"); continue; }
        NSString *ext = [[f substringFromIndex:dot.location + 1] lowercaseString];
        NSString *r = [m objectForKey:ext];
        puts(r ? [r UTF8String] : "UNKNOWN");
    }
}
