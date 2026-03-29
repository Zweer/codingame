s = new Scanner(System.in)
while (true) {
    def max = -1, idx = 0
    (0..7).each { i ->
        def h = s.nextInt()
        if (h > max) { max = h; idx = i }
    }
    println idx
}
