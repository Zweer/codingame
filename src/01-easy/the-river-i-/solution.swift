func ds(_ n:Int)->Int{var x=n,s=0;while x>0{s+=x%10;x/=10};return s}
var r1=Int(readLine()!)!,r2=Int(readLine()!)!
while r1 != r2{if r1<r2{r1+=ds(r1)}else{r2+=ds(r2)}}
print(r1)
