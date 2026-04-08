fun main(){
    val ab=mapOf("sp" to ' ',"bS" to '\\',"sQ" to '\'',"nl" to '\n')
    val line=readLine()!!
    val sb=StringBuilder()
    for(tok in line.split(" ")){
        val l2=if(tok.length>=2) tok.takeLast(2) else ""
        val (ch,num)=if(ab.containsKey(l2)) Pair(ab[l2]!!,tok.dropLast(2)) else Pair(tok.last(),tok.dropLast(1))
        val n=if(num.isEmpty()) 1 else num.toInt().coerceAtLeast(1)
        repeat(n){sb.append(ch)}
    }
    println(sb)
}
