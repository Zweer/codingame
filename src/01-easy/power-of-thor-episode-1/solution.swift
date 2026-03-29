while true {
    let line = readLine()!.split(" ").map { Int($0)! }
    var lx = line[0], ly = line[1], tx = line[2], ty = line[3]
    while true {
        _ = readLine()
        var dir = ""
        if ty > ly { dir += "N"; ty -= 1 }
        else if ty < ly { dir += "S"; ty += 1 }
        if tx > lx { dir += "W"; tx -= 1 }
        else if tx < lx { dir += "E"; tx += 1 }
        print(dir)
    }
}
