#include <stdio.h>
#include <string.h>
int dss(int n) { int s=0; while(n){int d=n%10;s+=d*d;n/=10;} return s; }
int main() {
    int n; scanf("%d", &n);
    while (n--) {
        char s[256]; scanf("%s", s);
        int x = 0;
        for (int i = 0; s[i]; i++) { int d = s[i]-'0'; x += d*d; }
        int seen[1000] = {0}, cnt = 0;
        while (x != 1) {
            for (int i = 0; i < cnt; i++) if (seen[i]==x) { printf("%s :(\n", s); goto next; }
            seen[cnt++] = x;
            x = dss(x);
        }
        printf("%s :)\n", s);
        next:;
    }
}
