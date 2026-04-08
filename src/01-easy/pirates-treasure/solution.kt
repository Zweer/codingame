fun main(){
    val w=readLine()!!.trim().toInt();val h=readLine()!!.trim().toInt()
    val g=Array(h){readLine()!!.trim().split(" ").map{it.toInt()}}
    val dx=intArrayOf(-1,-1,-1,0,0,1,1,1);val dy=intArrayOf(-1,0,1,-1,1,-1,0,1)
    for(y in 0 until h) for(x in 0 until w) if(g[y][x]==0){
        if((0..7).all{i->val nx=x+dx[i];val ny=y+dy[i];nx<0||nx>=w||ny<0||ny>=h||g[ny][nx]==1}){println("$x $y");return}
    }
}
