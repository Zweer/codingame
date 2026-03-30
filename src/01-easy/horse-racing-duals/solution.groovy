def s = new Scanner(System.in)
def n = s.nextInt()
def h = (1..n).collect { s.nextInt() }.sort()
def min = h[1] - h[0]
for (i in 1..<n-1) {
    def d = h[i+1] - h[i]
    if (d < min) min = d
}
println min
