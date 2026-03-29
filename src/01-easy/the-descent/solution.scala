import scala.io.StdIn

object Player {
    def main(args: Array[String]): Unit = {
        while (true) {
            var max = -1
            var idx = 0
            for (i <- 0 until 8) {
                val h = StdIn.readInt()
                if (h > max) { max = h; idx = i }
            }
            println(idx)
        }
    }
}
