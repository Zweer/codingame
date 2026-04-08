import Foundation
let C = Array("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ")
let dims = readLine()!.split(separator: " ").map { Int($0)! }
let (w, h) = (dims[0], dims[1])
var g = (0..<h).map { _ in Array(readLine()!) }
var d = Array(repeating: Array(repeating: -1, count: w), count: h)
var sr = 0, sc = 0
for r in 0..<h { for c in 0..<w { if g[r][c] == "S" { sr = r; sc = c } } }
d[sr][sc] = 0
var q = [(sr, sc)]; var qi = 0
let dirs = [(0,1),(0,-1),(1,0),(-1,0)]
while qi < q.count {
    let (r, c) = q[qi]; qi += 1
    for (dr, dc) in dirs {
        let nr = (r+dr+h)%h, nc = (c+dc+w)%w
        if g[nr][nc] != "#" && d[nr][nc] == -1 { d[nr][nc] = d[r][c]+1; q.append((nr, nc)) }
    }
}
for r in 0..<h { print(String((0..<w).map { c in g[r][c] == "#" ? Character("#") : d[r][c] == -1 ? Character(".") : C[d[r][c]] })) }
