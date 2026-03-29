import 'dart:io';
void main() {
    int n = int.parse(stdin.readLineSync()!);
    if (n == 0) { print(0); return; }
    var t = stdin.readLineSync()!.split(' ').map(int.parse).toList();
    int r = t[0];
    for (var v in t) {
        if (v.abs() < r.abs() || (v.abs() == r.abs() && v > 0)) r = v;
    }
    print(r);
}
