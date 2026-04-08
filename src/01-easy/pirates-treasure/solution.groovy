s = new Scanner(System.in)
int w = s.nextInt(), h = s.nextInt()
def g = (0..<h).collect { (0..<w).collect { s.nextInt() } }
def dx = [-1,-1,-1,0,0,1,1,1], dy = [-1,0,1,-1,1,-1,0,1]
for (y in 0..<h) for (x in 0..<w) if (g[y][x] == 0) {
    if ((0..7).every { i -> int nx=x+dx[i],ny=y+dy[i]; nx<0||nx>=w||ny<0||ny>=h||g[ny][nx]==1 }) {
        println "$x $y"; return
    }
}
