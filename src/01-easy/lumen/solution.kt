import kotlin.math.abs
import kotlin.math.max
fun main(){
    val n=readLine()!!.trim().toInt();val l=readLine()!!.trim().toInt()
    val g=Array(n){readLine()!!.trim().split(" ")}
    var d=0
    for(r in 0 until n) for(c in 0 until n){
        val lit=(0 until n).any{r2->(0 until n).any{c2->g[r2][c2]=="C"&&max(abs(r-r2),abs(c-c2))<l}}
        if(!lit) d++
    }
    println(d)
}
