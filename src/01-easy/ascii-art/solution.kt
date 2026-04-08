fun main(){
    val L=readLine()!!.trim().toInt();val H=readLine()!!.trim().toInt()
    val T=readLine()!!.uppercase()
    val rows=Array(H){readLine()!!}
    for(i in 0 until H){
        val sb=StringBuilder()
        for(c in T){var idx=c-'A';if(idx<0||idx>25)idx=26;sb.append(rows[i].substring(idx*L,idx*L+L))}
        println(sb)
    }
}
