#include <stdio.h>
#include <string.h>
#include <ctype.h>
void lower(char *s) { for (; *s; s++) *s = tolower(*s); }
int main() {
    int n, q;
    scanf("%d %d", &n, &q); getchar();
    char exts[10001][12], types[10001][256];
    for (int i = 0; i < n; i++) {
        scanf("%s %s", exts[i], types[i]); getchar();
        lower(exts[i]);
    }
    char line[512];
    for (int i = 0; i < q; i++) {
        fgets(line, sizeof(line), stdin);
        line[strcspn(line, "\r\n")] = 0;
        char *dot = strrchr(line, '.');
        if (!dot) { puts("UNKNOWN"); continue; }
        char ext[256];
        strcpy(ext, dot + 1);
        lower(ext);
        int found = 0;
        for (int j = 0; j < n; j++) {
            if (strcmp(ext, exts[j]) == 0) { puts(types[j]); found = 1; break; }
        }
        if (!found) puts("UNKNOWN");
    }
}
