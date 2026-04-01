object Solution extends App {
  val msg = scala.io.StdIn.readLine()
  val bin = msg.map(c => String.format("%7s", Integer.toBinaryString(c.toInt)).replace(' ', '0')).mkString
  val parts = collection.mutable.ListBuffer[String]()
  var i = 0
  while (i < bin.length) {
    val cur = bin(i)
    var count = 0
    while (i < bin.length && bin(i) == cur) { count += 1; i += 1 }
    parts += s"${if (cur == '1') "0" else "00"} ${"0" * count}"
  }
  println(parts.mkString(" "))
}
