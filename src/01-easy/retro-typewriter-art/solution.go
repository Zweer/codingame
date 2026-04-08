package main
import("bufio";"fmt";"os";"strconv";"strings")
func main(){
    ab:=map[string]rune{"sp":' ',"bS":'\\',"sQ":'\'',"nl":'\n'}
    sc:=bufio.NewScanner(os.Stdin);sc.Buffer(make([]byte,1<<20),1<<20);sc.Scan()
    var out strings.Builder
    for _,tok:=range strings.Split(sc.Text()," "){
        var ch rune;var num string
        if len(tok)>=2{
            l2:=tok[len(tok)-2:]
            if c,ok:=ab[l2];ok{ch=c;num=tok[:len(tok)-2]}else{ch=rune(tok[len(tok)-1]);num=tok[:len(tok)-1]}
        }else{ch=rune(tok[0]);num=""}
        n:=1;if num!=""{n,_=strconv.Atoi(num);if n<1{n=1}}
        for i:=0;i<n;i++{out.WriteRune(ch)}
    }
    fmt.Println(out.String())
}
