import std.stdio, std.conv, std.string, std.math, std.array, std.algorithm;
void main() {
    int n = readln.strip.to!int;
    if (n == 0) { writeln(0); return; }
    auto t = readln.strip.split(" ").map!(a => a.to!int).array;
    int r = t[0];
    foreach (v; t)
        if (abs(v) < abs(r) || (abs(v) == abs(r) && v > 0)) r = v;
    writeln(r);
}
