object Solution extends App {
  def ds(n:Long):Long={var x=n;var s=0L;while(x>0){s+=x%10;x/=10};s}
  val r=scala.io.StdIn.readLong()
  println(if((math.max(1L,r-45) until r).exists(x=>x+ds(x)==r))"YES" else "NO")
}
