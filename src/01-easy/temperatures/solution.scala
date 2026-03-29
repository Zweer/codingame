import scala.io.StdIn
import scala.math.abs
object Solution {
    def main(args: Array[String]): Unit = {
        val n = StdIn.readInt()
        if (n == 0) { println(0); return }
        val t = StdIn.readLine().trim.split(" ").map(_.toInt)
        var r = t(0)
        for (v <- t)
            if (abs(v) < abs(r) || (abs(v) == abs(r) && v > 0)) r = v
        println(r)
    }
}
