package main
import("bufio";"fmt";"os";"strings")
func abs(x int)int{if x<0{return -x};return x}
func max(a,b int)int{if a>b{return a};return b}
func main(){
    sc:=bufio.NewScanner(os.Stdin);sc.Buffer(make([]byte,1<<20),1<<20)
    var n,l int;sc.Scan();fmt.Sscan(sc.Text(),&n);sc.Scan();fmt.Sscan(sc.Text(),&l)
    g:=make([][]string,n);for i:=range g{sc.Scan();g[i]=strings.Split(sc.Text()," ")}
    d:=0
    for r:=0;r<n;r++{for c:=0;c<n;c++{lit:=false
        for r2:=0;r2<n&&!lit;r2++{for c2:=0;c2<n&&!lit;c2++{
            if g[r2][c2]=="C"&&max(abs(r-r2),abs(c-c2))<l{lit=true}}}
        if!lit{d++}}}
    fmt.Println(d)
}
