import std.stdio, std.string, std.conv, std.format, std.array;
void main() {
    string msg = readln.strip;
    string bin;
    foreach (c; msg)
        bin ~= format("%07b", cast(int)c);
    string[] parts;
    int i = 0;
    while (i < bin.length) {
        char cur = bin[i];
        int count = 0;
        while (i < bin.length && bin[i] == cur) { count++; i++; }
        parts ~= (cur == '1' ? "0" : "00") ~ " " ~ "0".replicate(count);
    }
    writeln(parts.join(" "));
}
