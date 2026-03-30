import std.stdio, std.string, std.uni;
void main() {
    int n, q;
    readf!"%d %d\n"(n, q);
    string[string] m;
    foreach (_; 0..n) {
        auto parts = readln.strip.split(" ");
        m[parts[0].toLower] = parts[1];
    }
    foreach (_; 0..q) {
        auto f = readln.strip;
        auto dot = f.lastIndexOf('.');
        if (dot < 0) { writeln("UNKNOWN"); continue; }
        auto ext = f[dot+1..$].toLower;
        writeln(ext in m ? m[ext] : "UNKNOWN");
    }
}
