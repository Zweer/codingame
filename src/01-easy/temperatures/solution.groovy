s = new Scanner(System.in)
def n = s.nextInt()
if (n == 0) { println 0 } else {
    s.nextLine()
    def t = s.nextLine().trim().split(" ").collect { it as int }
    def r = t[0]
    t.each { v -> if (Math.abs(v) < Math.abs(r) || (Math.abs(v) == Math.abs(r) && v > 0)) r = v }
    println r
}
