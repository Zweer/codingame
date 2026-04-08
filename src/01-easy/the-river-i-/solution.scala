object Solution extends App {
  def ds(n:Long):Long={var x=n;var s=0L;while(x>0){s+=x%10;x/=10};s}
  var r1=scala.io.StdIn.readLong();var r2=scala.io.StdIn.readLong()
  while(r1!=r2){if(r1<r2)r1+=ds(r1) else r2+=ds(r2)}
  println(r1)
}
