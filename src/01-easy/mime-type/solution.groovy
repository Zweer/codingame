def s = new Scanner(System.in)
def n = s.nextInt()
def q = s.nextInt(); s.nextLine()
def m = [:]
n.times {
    def p = s.nextLine().split(' ')
    m[p[0].toLowerCase()] = p[1]
}
q.times {
    def f = s.nextLine()
    def dot = f.lastIndexOf('.')
    if (dot == -1) { println 'UNKNOWN'; return }
    def ext = f.substring(dot + 1).toLowerCase()
    println(m[ext] ?: 'UNKNOWN')
}
