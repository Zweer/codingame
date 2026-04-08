s = new Scanner(System.in)
int n = s.nextInt(); s.nextLine()
n.times {
    def str = s.nextLine().trim()
    int x = str.collect { ((it as char) - 48) ** 2 }.sum()
    def seen = [] as Set
    while (x != 1 && seen.add(x)) {
        int t = 0; while (x > 0) { int d = x % 10; t += d*d; x = (int)(x/10) }; x = t
    }
    println "${str} ${x == 1 ? ':)' : ':('}"
}
