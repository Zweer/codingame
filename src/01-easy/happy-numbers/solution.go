package main
import("bufio";"fmt";"os")
func dss(n int)int{s:=0;for n>0{d:=n%10;s+=d*d;n/=10};return s}
func main(){
    sc:=bufio.NewScanner(os.Stdin)
    sc.Scan()
    var n int;fmt.Sscan(sc.Text(),&n)
    for i:=0;i<n;i++{
        sc.Scan();s:=sc.Text()
        x:=0;for _,c:=range s{d:=int(c)-48;x+=d*d}
        seen:=map[int]bool{}
        for x!=1&&!seen[x]{seen[x]=true;x=dss(x)}
        if x==1{fmt.Printf("%s :)\n",s)}else{fmt.Printf("%s :(\n",s)}
    }
}
