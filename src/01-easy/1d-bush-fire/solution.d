import std.stdio, std.string, std.conv;
void main(){
    int n=readln.strip.to!int;
    foreach(_; 0..n){
        auto s=readln.strip; int d=0,j=0;
        while(j<cast(int)s.length){if(s[j]=='f'){d++;j+=3;}else j++;}
        writeln(d);
    }
}
