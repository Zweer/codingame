object Solution extends App {
  val L=scala.io.StdIn.readInt();val H=scala.io.StdIn.readInt()
  val T=scala.io.StdIn.readLine().toUpperCase
  val rows=Array.fill(H)(scala.io.StdIn.readLine())
  for(i<-0 until H){
    println(T.map{c=>val idx={val i=c-'A';if(i<0||i>25)26 else i};rows(i).substring(idx*L,idx*L+L)}.mkString)
  }
}
