import scala.io.StdIn
object Solution {
  def main(args: Array[String]): Unit = {
    val n = StdIn.readInt()
    val q = StdIn.readInt()
    val m = (1 to n).map { _ =>
      val p = StdIn.readLine().split(" ")
      p(0).toLowerCase -> p(1)
    }.toMap
    (1 to q).foreach { _ =>
      val f = StdIn.readLine()
      val dot = f.lastIndexOf('.')
      if (dot == -1) println("UNKNOWN")
      else println(m.getOrElse(f.substring(dot + 1).toLowerCase, "UNKNOWN"))
    }
  }
}
