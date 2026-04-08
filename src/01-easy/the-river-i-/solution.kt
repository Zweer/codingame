fun ds(n:Long):Long{var x=n;var s=0L;while(x>0){s+=x%10;x/=10};return s}
fun main(){
    var r1=readLine()!!.trim().toLong();var r2=readLine()!!.trim().toLong()
    while(r1!=r2){if(r1<r2)r1+=ds(r1) else r2+=ds(r2)}
    println(r1)
}
