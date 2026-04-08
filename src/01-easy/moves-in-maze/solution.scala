import scala.io.StdIn
import scala.collection.mutable
object Solution {
    def main(args: Array[String]): Unit = {
        val C = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        val Array(w, h) = StdIn.readLine().split(" ").map(_.toInt)
        val g = Array.fill(h)(StdIn.readLine())
        val d = Array.fill(h, w)(-1)
        var sr = 0; var sc = 0
        for (r <- 0 until h; c <- 0 until w) if (g(r)(c) == 'S') { sr = r; sc = c }
        d(sr)(sc) = 0
        val q = mutable.Queue((sr, sc))
        val dirs = Array((0,1),(0,-1),(1,0),(-1,0))
        while (q.nonEmpty) { val (r, c) = q.dequeue(); for ((dr, dc) <- dirs) {
            val nr = (r+dr+h)%h; val nc = (c+dc+w)%w
            if (g(nr)(nc) != '#' && d(nr)(nc) == -1) { d(nr)(nc) = d(r)(c)+1; q.enqueue((nr, nc)) }
        }}
        for (r <- 0 until h) println((0 until w).map(c => if (g(r)(c) == '#') '#' else if (d(r)(c) == -1) '.' else C(d(r)(c))).mkString)
    }
}
