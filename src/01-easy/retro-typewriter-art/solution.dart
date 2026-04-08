import 'dart:io';
void main(){
    final ab={'sp':' ','bS':'\\','sQ':"'",'nl':'\n'};
    final line=stdin.readLineSync()!;
    final sb=StringBuffer();
    for(final tok in line.split(' ')){
        String ch,num;
        final l2=tok.length>=2?tok.substring(tok.length-2):'';
        if(ab.containsKey(l2)){ch=ab[l2]!;num=tok.substring(0,tok.length-2);}
        else{ch=tok[tok.length-1];num=tok.substring(0,tok.length-1);}
        int n=num.isEmpty?1:int.parse(num);if(n<1)n=1;
        for(int i=0;i<n;i++) sb.write(ch);
    }
    print(sb);
}
