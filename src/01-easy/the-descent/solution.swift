while true {
    var max = -1, idx = 0
    for i in 0..<8 {
        let h = Int(readLine()!)!
        if h > max { max = h; idx = i }
    }
    print(idx)
}
