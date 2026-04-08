package main
import("bufio";"fmt";"os";"strings")
func main(){
    r:=bufio.NewReader(os.Stdin)
    var L,H int;fmt.Fscan(r,&L);fmt.Fscan(r,&H);r.ReadString('\n')
    T,_:=r.ReadString('\n');T=strings.TrimSpace(strings.ToUpper(T))
    rows:=make([]string,H)
    for i:=0;i<H;i++{s,_:=r.ReadString('\n');rows[i]=strings.TrimRight(s,"\n")}
    for i:=0;i<H;i++{
        for _,c:=range T{
            idx:=int(c)-65;if idx<0||idx>25{idx=26}
            fmt.Print(rows[i][idx*L:idx*L+L])
        }
        fmt.Println()
    }
}
