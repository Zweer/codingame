import std.stdio, std.conv, std.string, std.array, std.algorithm;
void main(){
    string[string] ab=["sp":" ","bS":"\\","sQ":"'","nl":"\n"];
    string line=readln.strip;
    string res;
    foreach(tok; line.split(" ")){
        if(tok.length==0) continue;
        string l2=tok.length>=2?tok[$-2..$]:"";
        char ch; string num;
        if(l2 in ab){ch=ab[l2][0];num=tok[0..$-2];}
        else{ch=tok[$-1];num=tok[0..$-1];}
        int n=num.length>0?num.to!int:1;
        foreach(_; 0..n) res~=ch;
    }
    write(res);
    writeln();
}