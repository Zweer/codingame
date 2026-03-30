fun main() {
    val n = readLine()!!.trim().toInt()
    val q = readLine()!!.trim().toInt()
    val m = mutableMapOf<String,String>()
    repeat(n) {
        val (ext, mt) = readLine()!!.split(" ")
        m[ext.lowercase()] = mt
    }
    repeat(q) {
        val f = readLine()!!
        val dot = f.lastIndexOf('.')
        if (dot == -1) println("UNKNOWN")
        else println(m[f.substring(dot + 1).lowercase()] ?: "UNKNOWN")
    }
}
