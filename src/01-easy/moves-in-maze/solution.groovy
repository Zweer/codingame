s = new Scanner(System.in)
def C = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
def (w, h) = [s.nextInt(), s.nextInt()]; s.nextLine()
def g = (0..<h).collect { s.nextLine() }
def d = (0..<h).collect { new int[w].collect { -1 } }
int sr = 0, sc = 0
(0..<h).each { r -> (0..<w).each { c -> if (g[r][c] == 'S') { sr = r; sc = c } } }
d[sr][sc] = 0
def q = [[sr, sc]] as LinkedList
def dirs = [[0,1],[0,-1],[1,0],[-1,0]]
while (q) {
    def (r, c) = q.poll()
    dirs.each { dir -> int nr = (r+dir[0]+h)%h, nc = (c+dir[1]+w)%w
        if (g[nr][nc] != '#' && d[nr][nc] == -1) { d[nr][nc] = d[r][c]+1; q.add([nr, nc]) }
    }
}
(0..<h).each { r -> println((0..<w).collect { c -> g[r][c] == '#' ? '#' : d[r][c] == -1 ? '.' : C[d[r][c]] }.join()) }
