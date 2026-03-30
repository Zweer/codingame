fun main() {
    val n = readLine()!!.trim().toInt()
    val h = (1..n).map { readLine()!!.trim().toInt() }.sorted()
    println(h.zipWithNext { a, b -> b - a }.min())
}
