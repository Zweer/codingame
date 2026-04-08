import std.stdio, std.conv, std.string, std.math, std.algorithm, std.array;
void main(){
    int n=readln.strip.to!int, l=readln.strip.to!int;
    string[][] g;foreach(_; 0..n) g~=readln.strip.split(" ");
    int d=0;
    foreach(r; 0..n) foreach(c; 0..n){bool lit=false;
        foreach(r2; 0..n) foreach(c2; 0..n)
            if(g[r2][c2]=="C"&&max(abs(r-r2),abs(c-c2))<l) lit=true;
        if(!lit) d++;}
    writeln(d);
}
