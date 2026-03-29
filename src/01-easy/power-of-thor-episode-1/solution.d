import std.stdio, std.conv, std.string, std.array;
void main() {
    auto parts = readln.strip.split(" ");
    int lx = parts[0].to!int, ly = parts[1].to!int;
    int tx = parts[2].to!int, ty = parts[3].to!int;
    while (true) {
        readln;
        string dir;
        if (ty > ly) { dir ~= "N"; ty--; }
        else if (ty < ly) { dir ~= "S"; ty++; }
        if (tx > lx) { dir ~= "W"; tx--; }
        else if (tx < lx) { dir ~= "E"; tx++; }
        writeln(dir);
        stdout.flush;
    }
}
