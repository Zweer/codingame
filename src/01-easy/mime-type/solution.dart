import 'dart:io';
void main() {
    int n = int.parse(stdin.readLineSync()!);
    int q = int.parse(stdin.readLineSync()!);
    var m = <String, String>{};
    for (var i = 0; i < n; i++) {
        var p = stdin.readLineSync()!.split(' ');
        m[p[0].toLowerCase()] = p[1];
    }
    for (var i = 0; i < q; i++) {
        var f = stdin.readLineSync()!;
        var dot = f.lastIndexOf('.');
        if (dot == -1) { print('UNKNOWN'); continue; }
        var ext = f.substring(dot + 1).toLowerCase();
        print(m[ext] ?? 'UNKNOWN');
    }
}
