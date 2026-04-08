import std.stdio, std.conv, std.string;
int ds(long n){int s=0;while(n>0){s+=cast(int)(n%10);n/=10;}return s;}
void main(){
    long r1=readln.strip.to!long, r2=readln.strip.to!long;
    while(r1!=r2){if(r1<r2)r1+=ds(r1);else r2+=ds(r2);}
    writeln(r1);
}
