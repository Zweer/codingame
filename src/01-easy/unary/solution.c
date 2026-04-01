#include <stdio.h>
#include <string.h>
int main() {
    char msg[200];
    fgets(msg, sizeof(msg), stdin);
    msg[strcspn(msg, "\n")] = 0;
    char bin[1400] = {0};
    int len = 0;
    for (int i = 0; msg[i]; i++)
        for (int b = 6; b >= 0; b--)
            bin[len++] = ((msg[i] >> b) & 1) + '0';
    int first = 1;
    int i = 0;
    while (i < len) {
        char cur = bin[i];
        int count = 0;
        while (i < len && bin[i] == cur) { count++; i++; }
        if (!first) printf(" ");
        first = 0;
        printf("%s ", cur == '1' ? "0" : "00");
        for (int j = 0; j < count; j++) printf("0");
    }
    printf("\n");
}
