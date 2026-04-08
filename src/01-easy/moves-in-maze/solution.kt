fun main(){
    val C="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    val(w,h)=readLine()!!.split(" ").map{it.toInt()}
    val g=Array(h){readLine()!!}
    val d=Array(h){IntArray(w){-1}}
    var sr=0;var sc=0
    for(r in 0 until h) for(c in 0 until w) if(g[r][c]=='S'){sr=r;sc=c}
    d[sr][sc]=0
    val q=ArrayDeque<Pair<Int,Int>>();q.add(sr to sc)
    val dr=intArrayOf(0,0,1,-1);val dc=intArrayOf(1,-1,0,0)
    while(q.isNotEmpty()){val(r,c)=q.removeFirst();for(i in 0..3){val nr=(r+dr[i]+h)%h;val nc=(c+dc[i]+w)%w
        if(g[nr][nc]!='#'&&d[nr][nc]==-1){d[nr][nc]=d[r][c]+1;q.add(nr to nc)}}}
    for(r in 0 until h) println((0 until w).map{c->if(g[r][c]=='#')'#' else if(d[r][c]==-1)'.' else C[d[r][c]]}.joinToString(""))
}
