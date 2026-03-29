lx, ly, tx, ty = [int(i) for i in input().split()]
while True:
    input()
    d = ""
    if ty > ly: d += "N"; ty -= 1
    elif ty < ly: d += "S"; ty += 1
    if tx > lx: d += "W"; tx -= 1
    elif tx < lx: d += "E"; tx += 1
    print(d)
