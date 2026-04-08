import std.stdio, std.conv, std.string, std.algorithm, std.array;
int dss(int n){int s=0;while(n>0){int d=n%10;s+=d*d;n/=10;}return s;}
void main(){
    int n=readln.strip.to!int;
    foreach(_; 0..n){
        string s=readln.strip;
        int x=s.map!(c=>(c-'0')*(c-'0')).sum;
        bool[int] seen;
        while(x!=1&&x !in seen){seen[x]=true;x=dss(x);}
        writefln("%s %s",s,x==1?":)":":(");
    }
}
