import std.stdio, std.conv, std.string, std.array;
void main(){
    int w=readln.strip.to!int, h=readln.strip.to!int;
    int[][] g;foreach(_; 0..h) g~=readln.strip.split(" ").map!(to!int).array;
    int[8] dx=[-1,-1,-1,0,0,1,1,1],dy=[-1,0,1,-1,1,-1,0,1];
    foreach(y; 0..h) foreach(x; 0..w) if(g[y][x]==0){
        bool ok=true;foreach(i; 0..8){int nx=x+dx[i],ny=y+dy[i];if(nx>=0&&nx<w&&ny>=0&&ny<h&&g[ny][nx]!=1)ok=false;}
        if(ok){writefln("%d %d",x,y);return;}
    }
}
