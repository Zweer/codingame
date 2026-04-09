import std.stdio, std.conv, std.string, std.array;
void main(){
    int w=readln.strip.to!int, h=readln.strip.to!int;
    int[][] g;foreach(_; 0..h) g~=readln.strip.split(" ").map!(to!int).array;
    foreach(y; 0..h) foreach(x; 0..w) if(g[y][x]==0){
        bool ok=true;
        foreach(dy; [-1,0,1]) foreach(dx; [-1,0,1]){
            if(dx==0&&dy==0) continue;
            int nx=x+dx,ny=y+dy;
            if(nx<0||nx>=w||ny<0||ny>=h||g[ny][nx]!=1) ok=false;
        }
        if(ok){writefln("%d %d",x,y);return;}
    }
}