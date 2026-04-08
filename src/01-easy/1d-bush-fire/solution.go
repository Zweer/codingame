package main
import("bufio";"fmt";"os")
func main(){
    sc:=bufio.NewScanner(os.Stdin);sc.Buffer(make([]byte,1<<20),1<<20)
    sc.Scan();var n int;fmt.Sscan(sc.Text(),&n)
    for i:=0;i<n;i++{
        sc.Scan();s:=sc.Text();d:=0;j:=0
        for j<len(s){if s[j]=='f'{d++;j+=3}else{j++}}
        fmt.Println(d)
    }
}
