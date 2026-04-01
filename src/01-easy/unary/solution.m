#import <Foundation/Foundation.h>
int main() {
    char buf[256];
    fgets(buf, sizeof(buf), stdin);
    buf[strcspn(buf, "\n")] = 0;
    char bin[1792] = {0};
    int len = 0;
    for (int i = 0; buf[i]; i++)
        for (int b = 6; b >= 0; b--)
            bin[len++] = ((buf[i] >> b) & 1) + '0';
    NSMutableArray *parts = [NSMutableArray new];
    int i = 0;
    while (i < len) {
        char cur = bin[i];
        int count = 0;
        while (i < len && bin[i] == cur) { count++; i++; }
        NSMutableString *zeros = [NSMutableString new];
        for (int j = 0; j < count; j++) [zeros appendString:@"0"];
        [parts addObject:[NSString stringWithFormat:@"%s %@", cur == '1' ? "0" : "00", zeros]];
    }
    puts([[parts componentsJoinedByString:@" "] UTF8String]);
}
