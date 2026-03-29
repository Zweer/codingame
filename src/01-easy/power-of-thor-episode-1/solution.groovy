s = new Scanner(System.in)
def (lx, ly, tx, ty) = [s.nextInt(), s.nextInt(), s.nextInt(), s.nextInt()]
while (true) {
    s.nextInt()
    def dir = ""
    if (ty > ly) { dir += "N"; ty-- }
    else if (ty < ly) { dir += "S"; ty++ }
    if (tx > lx) { dir += "W"; tx-- }
    else if (tx < lx) { dir += "E"; tx++ }
    println dir
}
