#include <stdio.h>
int main() {
    int lx, ly, tx, ty, e;
    scanf("%d %d %d %d", &lx, &ly, &tx, &ty);
    while (1) {
        scanf("%d", &e);
        char dir[3] = "";
        int i = 0;
        if (ty > ly) { dir[i++] = 'N'; ty--; }
        else if (ty < ly) { dir[i++] = 'S'; ty++; }
        if (tx > lx) { dir[i++] = 'W'; tx--; }
        else if (tx < lx) { dir[i++] = 'E'; tx++; }
        dir[i] = 0;
        printf("%s\n", dir);
    }
}
