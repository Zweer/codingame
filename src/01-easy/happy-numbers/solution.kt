fun dss(n: Int): Int { var x=n; var s=0; while(x>0){val d=x%10;s+=d*d;x/=10}; return s }
fun main() {
    val n = readLine()!!.trim().toInt()
    repeat(n) {
        val s = readLine()!!.trim()
        var x = s.sumOf { (it-'0')*(it-'0') }
        val seen = mutableSetOf<Int>()
        while (x!=1 && seen.add(x)) x = dss(x)
        println("$s ${if(x==1) ":)" else ":("}")
    }
}
