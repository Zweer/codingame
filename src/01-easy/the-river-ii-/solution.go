package main
import "fmt"
func ds(n int)int{s:=0;for n>0{s+=n%10;n/=10};return s}
func main(){
    var r int;fmt.Scan(&r)
    lo:=r-45;if lo<1{lo=1}
    for x:=lo;x<r;x++{if x+ds(x)==r{fmt.Println("YES");return}}
    fmt.Println("NO")
}
