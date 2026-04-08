fun main(){
    val n=readLine()!!.trim().toInt()
    repeat(n){
        val s=readLine()!!.trim();var d=0;var j=0
        while(j<s.length){if(s[j]=='f'){d++;j+=3}else j++}
        println(d)
    }
}
