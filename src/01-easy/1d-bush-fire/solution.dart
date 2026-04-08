import 'dart:io';
void main(){
    int n=int.parse(stdin.readLineSync()!);
    for(int i=0;i<n;i++){
        String s=stdin.readLineSync()!.trim();int d=0,j=0;
        while(j<s.length){if(s[j]=='f'){d++;j+=3;}else j++;}
        print(d);
    }
}
