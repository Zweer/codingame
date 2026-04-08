package main
import("bufio";"fmt";"os")
func main(){
    sc:=bufio.NewScanner(os.Stdin);sc.Buffer(make([]byte,1<<20),1<<20)
    var w,h int;sc.Scan();fmt.Sscan(sc.Text(),&w);sc.Scan();fmt.Sscan(sc.Text(),&h)
    g:=make([][]int,h)
    for y:=0;y<h;y++{sc.Scan();g[y]=make([]int,w);r:=sc.Text();j:=0
        for x:=0;x<w;x++{for j<len(r)&&r[j]==' '{j++};v:=0;for j<len(r)&&r[j]!=' '{v=v*10+int(r[j]-'0');j++};g[y][x]=v;j++}}
    dx:=[8]int{-1,-1,-1,0,0,1,1,1};dy:=[8]int{-1,0,1,-1,1,-1,0,1}
    for y:=0;y<h;y++{for x:=0;x<w;x++{if g[y][x]==0{
        ok:=true;for i:=0;i<8;i++{nx,ny:=x+dx[i],y+dy[i];if nx>=0&&nx<w&&ny>=0&&ny<h&&g[ny][nx]!=1{ok=false}}
        if ok{fmt.Println(x,y);return}}}}
}
