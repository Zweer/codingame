import scala.io.StdIn
object Solution {
    def dss(n: Int): Int = { var x=n; var s=0; while(x>0){val d=x%10;s+=d*d;x/=10}; s }
    def main(args: Array[String]): Unit = {
        val n = StdIn.readInt()
        for (_ <- 0 until n) {
            val s = StdIn.readLine().trim
            var x = s.map(c => (c-'0')*(c-'0')).sum
            val seen = scala.collection.mutable.Set[Int]()
            while (x != 1 && seen.add(x)) x = dss(x)
            println(s"$s ${if(x==1) ":)" else ":("}")
        }
    }
}
