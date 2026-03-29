import 'dart:io';
void main() {
    while (true) {
        int max = -1, idx = 0;
        for (int i = 0; i < 8; i++) {
            int h = int.parse(stdin.readLineSync()!);
            if (h > max) { max = h; idx = i; }
        }
        print(idx);
    }
}
