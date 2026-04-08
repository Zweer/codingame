import 'dart:io';
void main(){
    int w=int.parse(stdin.readLineSync()!),h=int.parse(stdin.readLineSync()!);
    var g=List.generate(h,(_)=>stdin.readLineSync()!.trim().split(' ').map(int.parse).toList());
    var dx=[-1,-1,-1,0,0,1,1,1],dy=[-1,0,1,-1,1,-1,0,1];
    for(int y=0;y<h;y++) for(int x=0;x<w;x++) if(g[y][x]==0){
        bool ok=true;for(int i=0;i<8;i++){int nx=x+dx[i],ny=y+dy[i];if(nx>=0&&nx<w&&ny>=0&&ny<h&&g[ny][nx]!=1)ok=false;}
        if(ok){print('$x $y');return;}
    }
}
