let line = readLine()!.split(separator: " ").map { Int($0)! }
let n = line[0]
if n == 0 { print(0) } else {
    let t = readLine()!.split(separator: " ").map { Int($0)! }
    var r = t[0]
    for v in t {
        if abs(v) < abs(r) || (abs(v) == abs(r) && v > 0) { r = v }
    }
    print(r)
}
