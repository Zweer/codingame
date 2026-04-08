n = int(input())
for _ in range(n):
    s = input(); d = j = 0
    while j < len(s):
        if s[j] == 'f': d += 1; j += 3
        else: j += 1
    print(d)
