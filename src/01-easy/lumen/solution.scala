import scala.io.StdIn
object Solution{def main(a:Array[String]):Unit={
    val n=StdIn.readInt();val l=StdIn.readInt()
    val g=Array.fill(n)(StdIn.readLine().trim.split(" "))
    var d=0
    for(r<-0 until n;c<-0 until n){
        val lit=(0 until n).exists(r2=>(0 until n).exists(c2=>g(r2)(c2)=="C"&&math.max(math.abs(r-r2),math.abs(c-c2))<l))
        if(!lit) d+=1
    }
    println(d)
}}
