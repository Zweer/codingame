import Foundation
let n = Int(readLine()!)!
for _ in 0..<n {
    let s = readLine()!.trimmingCharacters(in: .whitespaces)
    var x = s.unicodeScalars.reduce(0) { $0 + (Int($1.value)-48)*(Int($1.value)-48) }
    var seen = Set<Int>()
    while x != 1 && !seen.contains(x) { seen.insert(x); var t=0; var v=x; while v>0 { let d=v%10; t+=d*d; v/=10 }; x=t }
    print("\(s) \(x==1 ? ":)" : ":(")")
}
