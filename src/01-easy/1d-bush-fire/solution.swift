import Foundation
let n = Int(readLine()!)!
for _ in 0..<n {
    let s = Array(readLine()!); var d=0; var j=0
    while j < s.count { if s[j] == "f" { d+=1; j+=3 } else { j+=1 } }
    print(d)
}
