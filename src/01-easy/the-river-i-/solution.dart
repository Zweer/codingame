import 'dart:io';
int ds(int n){int s=0;while(n>0){s+=n%10;n=n~/10;}return s;}
void main(){
  int r1=int.parse(stdin.readLineSync()!), r2=int.parse(stdin.readLineSync()!);
  while(r1!=r2){if(r1<r2)r1+=ds(r1);else r2+=ds(r2);}
  print(r1);
}
