object Solution extends App {
    while (true) {
        val heights = (0 until 8).map(_ => scala.io.StdIn.readInt())
        println(heights.indexOf(heights.max))
    }
}
