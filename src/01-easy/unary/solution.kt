fun main() {
    val msg = readLine()!!
    val bin = msg.map { it.code.toString(2).padStart(7, '0') }.joinToString("")
    val parts = mutableListOf<String>()
    var i = 0
    while (i < bin.length) {
        val cur = bin[i]
        var count = 0
        while (i < bin.length && bin[i] == cur) { count++; i++ }
        parts.add("${if (cur == '1') "0" else "00"} ${"0".repeat(count)}")
    }
    println(parts.joinToString(" "))
}
