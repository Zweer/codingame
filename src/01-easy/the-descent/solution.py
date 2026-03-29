while True:
    mx, idx = -1, 0
    for i in range(8):
        h = int(input())
        if h > mx:
            mx, idx = h, i
    print(idx)
