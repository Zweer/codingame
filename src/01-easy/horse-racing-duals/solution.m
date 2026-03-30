#import <Foundation/Foundation.h>
int cmp(const void *a, const void *b) { return *(int*)a - *(int*)b; }
int main() {
    int n; scanf("%d", &n);
    int h[n];
    for (int i = 0; i < n; i++) scanf("%d", &h[i]);
    qsort(h, n, sizeof(int), cmp);
    int min = h[1] - h[0];
    for (int i = 1; i < n - 1; i++) {
        int d = h[i+1] - h[i];
        if (d < min) min = d;
    }
    printf("%d\n", min);
}
