let L=Int(readLine()!)!,H=Int(readLine()!)!
let T=Array(readLine()!.uppercased().unicodeScalars)
var rows=[String]();for _ in 0..<H{rows.append(readLine()!)}
for i in 0..<H{
    var line="";let arr=Array(rows[i])
    for c in T{
        var idx=Int(c.value)-65;if idx<0||idx>25{idx=26}
        line+=String(arr[idx*L..<idx*L+L])
    }
    print(line)
}
