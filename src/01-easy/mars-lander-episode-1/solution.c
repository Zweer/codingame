#include <stdio.h>

int main() {
    int surfaceN;
    scanf("%d", &surfaceN);
    for (int i = 0; i < surfaceN; i++) {
        int x, y;
        scanf("%d %d", &x, &y);
    }
    while (1) {
        int x, y, hSpeed, vSpeed, fuel, rotate, power;
        scanf("%d %d %d %d %d %d %d", &x, &y, &hSpeed, &vSpeed, &fuel, &rotate, &power);
        printf("0 %d\n", vSpeed < -36 ? 4 : 0);
    }
    return 0;
}
