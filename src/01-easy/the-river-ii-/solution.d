import std.stdio, std.conv, std.string, std.algorithm;
int ds(long n){int s=0;while(n>0){s+=cast(int)(n%10);n/=10;}return s;}
void main(){
    long r=readln.strip.to!long;
    foreach(x;max(1L,r-45)..r)if(x+ds(x)==r){writeln("YES");return;}
    writeln("NO");
}
