import scala.io.StdIn
object Solution {
  def main(args: Array[String]): Unit = {
    val n = StdIn.readInt()
    val h = (1 to n).map(_ => StdIn.readInt()).sorted
    println(h.sliding(2).map(w => w(1) - w(0)).min)
  }
}
