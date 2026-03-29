fun main() {
    val n = readLine()!!.trim().toInt()
    if (n == 0) { println(0); return }
    val t = readLine()!!.trim().split(" ").map { it.toInt() }
    var r = t[0]
    for (v in t) {
        if (Math.abs(v) < Math.abs(r) || (Math.abs(v) == Math.abs(r) && v > 0)) r = v
    }
    println(r)
}
