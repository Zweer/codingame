def sc = new Scanner(System.in)
int L = sc.nextInt(), H = sc.nextInt(); sc.nextLine()
String T = sc.nextLine().toUpperCase()
def rows = (0..<H).collect { sc.nextLine() }
(0..<H).each { i ->
    def line = T.collect { c ->
        int idx = (c as char) - ('A' as char); if(idx<0||idx>25) idx=26
        rows[i].substring(idx*L, idx*L+L)
    }.join()
    println line
}
