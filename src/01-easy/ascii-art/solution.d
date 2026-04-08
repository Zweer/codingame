import std.stdio, std.string, std.conv, std.uni;
void main(){
    int L=readln.strip.to!int, H=readln.strip.to!int;
    string T=readln.strip.toUpper;
    string[] rows;foreach(_; 0..H)rows~=readln.stripRight;
    foreach(i; 0..H){
        string line;
        foreach(c; T){
            int idx=c-'A'; if(idx<0||idx>25)idx=26;
            line~=rows[i][idx*L..idx*L+L];
        }
        writeln(line);
    }
}
