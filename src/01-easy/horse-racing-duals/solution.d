import std.stdio, std.conv, std.string, std.algorithm;
void main() {
    int n = readln.strip.to!int;
    int[] h;
    foreach (_; 0..n) h ~= readln.strip.to!int;
    h.sort();
    int m = h[1] - h[0];
    foreach (i; 1..cast(int)(h.length) - 1) {
        int d = h[i+1] - h[i];
        if (d < m) m = d;
    }
    writeln(m);
}
