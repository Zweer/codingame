fun main() {
    while (true) {
        var max = -1; var idx = 0
        for (i in 0..7) {
            val h = readLine()!!.trim().toInt()
            if (h > max) { max = h; idx = i }
        }
        println(idx)
    }
}
