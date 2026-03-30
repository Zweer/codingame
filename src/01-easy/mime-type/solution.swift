let n = Int(readLine()!)!
let q = Int(readLine()!)!
var m = [String: String]()
for _ in 0..<n {
    let p = readLine()!.split(separator: " ")
    m[String(p[0]).lowercased()] = String(p[1])
}
for _ in 0..<q {
    let f = readLine()!
    if let dot = f.lastIndex(of: ".") {
        let ext = String(f[f.index(after: dot)...]).lowercased()
        print(m[ext] ?? "UNKNOWN")
    } else {
        print("UNKNOWN")
    }
}
