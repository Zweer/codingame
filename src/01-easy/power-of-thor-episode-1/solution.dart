import 'dart:io';
void main() {
    var s = stdin.readLineSync()!.split(' ');
    int lx = int.parse(s[0]), ly = int.parse(s[1]);
    int tx = int.parse(s[2]), ty = int.parse(s[3]);
    while (true) {
        stdin.readLineSync();
        var dir = '';
        if (ty > ly) { dir += 'N'; ty--; }
        else if (ty < ly) { dir += 'S'; ty++; }
        if (tx > lx) { dir += 'W'; tx--; }
        else if (tx < lx) { dir += 'E'; tx++; }
        print(dir);
    }
}
