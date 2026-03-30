let n = Int(readLine()!)!
var h = (0..<n).map { _ in Int(readLine()!)! }
h.sort()
var m = h[1] - h[0]
for i in 1..<n-1 {
    let d = h[i+1] - h[i]
    if d < m { m = d }
}
print(m)
