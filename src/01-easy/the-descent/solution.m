#import <Foundation/Foundation.h>
int main() {
    while (1) {
        int max = -1, idx = 0;
        for (int i = 0; i < 8; i++) {
            int h; scanf("%d", &h);
            if (h > max) { max = h; idx = i; }
        }
        printf("%d\n", idx);
    }
    return 0;
}
