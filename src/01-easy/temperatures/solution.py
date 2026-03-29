n = int(input())
if n == 0: print(0)
else:
    t = list(map(int, input().split()))
    r = t[0]
    for v in t:
        if abs(v) < abs(r) or (abs(v) == abs(r) and v > 0): r = v
    print(r)
