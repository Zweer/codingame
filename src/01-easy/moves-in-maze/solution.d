import std.stdio, std.conv, std.string, std.array;
void main(){
    auto C="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    auto fl=readln.strip.split(" "); int w=fl[0].to!int, h=fl[1].to!int;
    string[] g; foreach(_; 0..h) g~=readln.strip;
    auto d=new int[][](h); foreach(r; 0..h){d[r]=new int[](w); d[r][]=(-1);}
    int sr=0,sc=0;
    foreach(r; 0..h) foreach(c; 0..w) if(g[r][c]=='S'){sr=r;sc=c;}
    d[sr][sc]=0;
    int[][] q=[[sr,sc]]; size_t qi=0;
    int[4] dr=[0,0,1,-1],dc=[1,-1,0,0];
    while(qi<q.length){auto p=q[qi++];int r=p[0],c=p[1];
        foreach(i; 0..4){int nr=(r+dr[i]+h)%h,nc=(c+dc[i]+w)%w;
            if(g[nr][nc]!='#'&&d[nr][nc]==-1){d[nr][nc]=d[r][c]+1;q~=[nr,nc];}}}
    foreach(r; 0..h){
        char[] s; foreach(c; 0..w) s~=g[r][c]=='#'?'#':d[r][c]==-1?'.':C[d[r][c]];
        writeln(s);
    }
}
