import 'dart:io';
void main() {
    int n = int.parse(stdin.readLineSync()!);
    List<int> h = List.generate(n, (_) => int.parse(stdin.readLineSync()!));
    h.sort();
    int min = h[1] - h[0];
    for (int i = 1; i < n - 1; i++) {
        int d = h[i+1] - h[i];
        if (d < min) min = d;
    }
    print(min);
}
