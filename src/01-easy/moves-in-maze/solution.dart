import 'dart:io';
import 'dart:collection';
void main(){
    const C='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var p=stdin.readLineSync()!.split(' ');int w=int.parse(p[0]),h=int.parse(p[1]);
    var g=List.generate(h,(_)=>stdin.readLineSync()!);
    var d=List.generate(h,(_)=>List.filled(w,-1));
    int sr=0,sc=0;
    for(int r=0;r<h;r++) for(int c=0;c<w;c++) if(g[r][c]=='S'){sr=r;sc=c;}
    d[sr][sc]=0;
    var q=Queue<List<int>>();q.add([sr,sc]);
    var dirs=[[0,1],[0,-1],[1,0],[-1,0]];
    while(q.isNotEmpty){var p=q.removeFirst();int r=p[0],c=p[1];
        for(var dir in dirs){int nr=(r+dir[0]+h)%h,nc=(c+dir[1]+w)%w;
            if(g[nr][nc]!='#'&&d[nr][nc]==-1){d[nr][nc]=d[r][c]+1;q.add([nr,nc]);}}}
    for(int r=0;r<h;r++) print(List.generate(w,(c)=>g[r][c]=='#'?'#':d[r][c]==-1?'.':C[d[r][c]]).join());
}
