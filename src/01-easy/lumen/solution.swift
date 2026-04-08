import Foundation
let n=Int(readLine()!)!;let l=Int(readLine()!)!
var g=[[String]]();for _ in 0..<n{g.append(readLine()!.split(separator:" ").map(String.init))}
var d=0
for r in 0..<n{for c in 0..<n{
    var lit=false
    for r2 in 0..<n{for c2 in 0..<n{if g[r2][c2]=="C"&&max(abs(r-r2),abs(c-c2))<l{lit=true}}}
    if !lit{d+=1}
}}
print(d)
