import scala.io.StdIn
object Solution {
    def main(args: Array[String]): Unit = {
        val ab = Map("sp"->' ',"bS"->'\\',"sQ"->'\'',"nl"->'\n')
        val line = StdIn.readLine()
        val sb = new StringBuilder
        for (tok <- line.split(" ")) {
            val l2 = if(tok.length>=2) tok.takeRight(2) else ""
            val (ch, num) = if(ab.contains(l2)) (ab(l2), tok.dropRight(2)) else (tok.last, tok.dropRight(1))
            val n = if(num.isEmpty) 1 else math.max(1, num.toInt)
            sb.append(ch.toString * n)
        }
        println(sb)
    }
}
