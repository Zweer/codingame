package main
import "fmt"
func ds(n int)int{s:=0;for n>0{s+=n%10;n/=10};return s}
func main(){
    var r1,r2 int;fmt.Scan(&r1);fmt.Scan(&r2)
    for r1!=r2{if r1<r2{r1+=ds(r1)}else{r2+=ds(r2)}}
    fmt.Println(r1)
}
