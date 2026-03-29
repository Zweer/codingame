const inputs = readline()!!.split(" ").map { it.toInt() }
var lx = inputs[0]; var ly = inputs[1]; var tx = inputs[2]; var ty = inputs[3]
while (true) {
    readLine()
    var dir = ""
    if (ty > ly) { dir += "N"; ty-- } else if (ty < ly) { dir += "S"; ty++ }
    if (tx > lx) { dir += "W"; tx-- } else if (tx < lx) { dir += "E"; tx++ }
    println(dir)
}
