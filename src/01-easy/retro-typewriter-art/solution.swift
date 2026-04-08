import Foundation
let ab: [String: Character] = ["sp": " ", "bS": "\\", "sQ": "'", "nl": "\n"]
let line = readLine()!
var out = ""
for tok in line.split(separator: " ") {
    let s = String(tok)
    let l2 = s.count >= 2 ? String(s.suffix(2)) : ""
    let ch: Character; let num: String
    if let c = ab[l2] { ch = c; num = String(s.dropLast(2)) }
    else { ch = s.last!; num = String(s.dropLast(1)) }
    let n = max(1, num.isEmpty ? 1 : Int(num)!)
    out += String(repeating: ch, count: n)
}
print(out)
