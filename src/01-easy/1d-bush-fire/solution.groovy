s = new Scanner(System.in)
int n = s.nextInt(); s.nextLine()
n.times {
    def str = s.nextLine().trim(); int d = 0, j = 0
    while (j < str.length()) { if (str[j] == 'f') { d++; j += 3 } else j++ }
    println d
}
