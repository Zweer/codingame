import 'dart:io';
import 'dart:math';
void main(){
    int n=int.parse(stdin.readLineSync()!),l=int.parse(stdin.readLineSync()!);
    var g=List.generate(n,(_)=>stdin.readLineSync()!.trim().split(' '));
    int d=0;
    for(int r=0;r<n;r++) for(int c=0;c<n;c++){bool lit=false;
        for(int r2=0;r2<n&&!lit;r2++) for(int c2=0;c2<n&&!lit;c2++)
            if(g[r2][c2]=='C'&&max((r-r2).abs(),(c-c2).abs())<l) lit=true;
        if(!lit) d++;}
    print(d);
}
