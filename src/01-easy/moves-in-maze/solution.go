package main
import("bufio";"fmt";"os";"strings")
func main(){
    C:="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    sc:=bufio.NewScanner(os.Stdin);sc.Buffer(make([]byte,1<<20),1<<20)
    sc.Scan();var w,h int;fmt.Sscan(sc.Text(),&w,&h)
    g:=make([]string,h);for i:=range g{sc.Scan();g[i]=sc.Text()}
    d:=make([][]int,h);for i:=range d{d[i]=make([]int,w);for j:=range d[i]{d[i][j]=-1}}
    sr,sc2:=0,0
    for r:=0;r<h;r++{for c:=0;c<w;c++{if g[r][c]=='S'{sr=r;sc2=c}}}
    d[sr][sc2]=0
    type P struct{r,c int}
    q:=[]P{{sr,sc2}}
    dr:=[4]int{0,0,1,-1};dc:=[4]int{1,-1,0,0}
    for len(q)>0{
        p:=q[0];q=q[1:]
        for i:=0;i<4;i++{nr:=(p.r+dr[i]+h)%h;nc:=(p.c+dc[i]+w)%w
            if g[nr][nc]!='#'&&d[nr][nc]==-1{d[nr][nc]=d[p.r][p.c]+1;q=append(q,P{nr,nc})}}
    }
    var sb strings.Builder
    for r:=0;r<h;r++{for c:=0;c<w;c++{
        if g[r][c]=='#'{sb.WriteByte('#')}else if d[r][c]==-1{sb.WriteByte('.')}else{sb.WriteByte(C[d[r][c]])}
    };sb.WriteByte('\n')}
    fmt.Print(sb.String())
}
