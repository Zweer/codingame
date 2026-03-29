import scala.io.StdIn
object Player {
    def main(args: Array[String]): Unit = {
        val Array(lx, ly, tx0, ty0) = StdIn.readLine().split(" ").map(_.toInt)
        var tx = tx0; var ty = ty0
        while (true) {
            StdIn.readLine()
            var dir = ""
            if (ty > ly) { dir += "N"; ty -= 1 }
            else if (ty < ly) { dir += "S"; ty += 1 }
            if (tx > lx) { dir += "W"; tx -= 1 }
            else if (tx < lx) { dir += "E"; tx += 1 }
            println(dir)
        }
    }
}
