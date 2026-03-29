#import <Foundation/Foundation.h>
#include <stdlib.h>
int main() {
    int n, v, r;
    scanf("%d", &n);
    if (n == 0) { printf("0\n"); return 0; }
    scanf("%d", &r);
    for (int i = 1; i < n; i++) {
        scanf("%d", &v);
        if (abs(v) < abs(r) || (abs(v) == abs(r) && v > 0)) r = v;
    }
    printf("%d\n", r);
}
