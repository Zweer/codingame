import std.stdio, std.conv, std.string;
void main() {
    while (true) {
        int max = -1, idx = 0;
        foreach (i; 0 .. 8) {
            int h = readln.strip.to!int;
            if (h > max) { max = h; idx = i; }
        }
        writeln(idx);
    }
}
