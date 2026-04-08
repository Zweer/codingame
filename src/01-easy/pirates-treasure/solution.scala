import scala.io.StdIn
object Solution{def main(a:Array[String]):Unit={
    val w=StdIn.readInt();val h=StdIn.readInt()
    val g=Array.fill(h)(StdIn.readLine().trim.split(" ").map(_.toInt))
    val dx=Array(-1,-1,-1,0,0,1,1,1);val dy=Array(-1,0,1,-1,1,-1,0,1)
    for(y<-0 until h;x<-0 until w) if(g(y)(x)==0){
        if((0 to 7).forall{i=>val nx=x+dx(i);val ny=y+dy(i);nx<0||nx>=w||ny<0||ny>=h||g(ny)(nx)==1}){println(s"$x $y");return}
    }
}}
