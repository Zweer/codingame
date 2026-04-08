import 'dart:io';
void main(){
  int L=int.parse(stdin.readLineSync()!), H=int.parse(stdin.readLineSync()!);
  String T=stdin.readLineSync()!.toUpperCase();
  List<String> rows=List.generate(H,(_)=>stdin.readLineSync()!);
  for(int i=0;i<H;i++){
    StringBuffer sb=StringBuffer();
    for(int j=0;j<T.length;j++){
      int idx=T.codeUnitAt(j)-65;if(idx<0||idx>25)idx=26;
      sb.write(rows[i].substring(idx*L,idx*L+L));
    }
    print(sb);
  }
}
