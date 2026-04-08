import 'dart:io';
import 'dart:math';
int ds(int n){int s=0;while(n>0){s+=n%10;n=n~/10;}return s;}
void main(){
  int r=int.parse(stdin.readLineSync()!);
  for(int x=max(1,r-45);x<r;x++)if(x+ds(x)==r){print("YES");return;}
  print("NO");
}
