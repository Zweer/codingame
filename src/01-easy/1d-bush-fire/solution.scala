import scala.io.StdIn
object Solution {
    def main(args: Array[String]): Unit = {
        val n = StdIn.readInt()
        for (_ <- 0 until n) {
            val s = StdIn.readLine().trim; var d=0; var j=0
            while (j < s.length) { if (s(j)=='f') { d+=1; j+=3 } else j+=1 }
            println(d)
        }
    }
}
