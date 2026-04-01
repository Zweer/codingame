let msg = readLine()!
var bin = ""
for c in msg.unicodeScalars {
    let s = String(c.value, radix: 2)
    bin += String(repeating: "0", count: 7 - s.count) + s
}
var parts: [String] = []
var i = bin.startIndex
while i < bin.endIndex {
    let cur = bin[i]
    var count = 0
    while i < bin.endIndex && bin[i] == cur { count += 1; i = bin.index(after: i) }
    parts.append("\(cur == "1" ? "0" : "00") \(String(repeating: "0", count: count))")
}
print(parts.joined(separator: " "))
