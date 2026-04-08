fun ds(n:Long):Long{var x=n;var s=0L;while(x>0){s+=x%10;x/=10};return s}
fun main(){
    val r=readLine()!!.trim().toLong()
    println(if((maxOf(1L,r-45) until r).any{it+ds(it)==r})"YES" else "NO")
}
