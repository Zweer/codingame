n = int(input())
xs = []
ys = []
for _ in range(n):
    x, y = map(int, input().split())
    xs.append(x)
    ys.append(y)
ys.sort()
median = ys[n // 2]
horizontal = max(xs) - min(xs)
vertical = sum(abs(y - median) for y in ys)
print(horizontal + vertical)
