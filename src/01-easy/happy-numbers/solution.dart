import 'dart:io';
int dss(int n){int s=0;while(n>0){int d=n%10;s+=d*d;n~/=10;}return s;}
void main(){
    int n=int.parse(stdin.readLineSync()!);
    for(int i=0;i<n;i++){
        String s=stdin.readLineSync()!.trim();
        int x=s.codeUnits.fold(0,(a,c)=>a+(c-48)*(c-48));
        Set<int> seen={};
        while(x!=1&&seen.add(x)) x=dss(x);
        print('$s ${x==1?":)":":("}');
    }
}
