import 'dart:io';
void main() {
    String msg = stdin.readLineSync()!;
    String bin = msg.codeUnits.map((c) => c.toRadixString(2).padLeft(7, '0')).join();
    List<String> parts = [];
    int i = 0;
    while (i < bin.length) {
        String cur = bin[i];
        int count = 0;
        while (i < bin.length && bin[i] == cur) { count++; i++; }
        parts.add('${cur == '1' ? '0' : '00'} ${'0' * count}');
    }
    print(parts.join(' '));
}
