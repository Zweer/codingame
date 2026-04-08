s = new Scanner(System.in)
int n = s.nextInt(), l = s.nextInt(); s.nextLine()
def g = (0..<n).collect { s.nextLine().split(' ') }
int d = 0
(0..<n).each { r -> (0..<n).each { c ->
    def lit = (0..<n).any { r2 -> (0..<n).any { c2 -> g[r2][c2] == 'C' && Math.max(Math.abs(r-r2), Math.abs(c-c2)) < l } }
    if (!lit) d++
}}
println d
