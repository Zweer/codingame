import Foundation
let w=Int(readLine()!)!;let h=Int(readLine()!)!
var g=[[Int]]();for _ in 0..<h{g.append(readLine()!.split(separator:" ").map{Int($0)!})}
let dx=[-1,-1,-1,0,0,1,1,1],dy=[-1,0,1,-1,1,-1,0,1]
for y in 0..<h{for x in 0..<w{if g[y][x]==0{
    let ok=(0..<8).allSatisfy{i in let nx=x+dx[i],ny=y+dy[i];return nx<0||nx>=w||ny<0||ny>=h||g[ny][nx]==1}
    if ok{print("\(x) \(y)");exit(0)}
}}}
