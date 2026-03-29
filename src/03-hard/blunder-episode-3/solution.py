import math

n = int(input())
data = []
for _ in range(n):
    num, t = map(int, input().split())
    data.append((num, t))

complexities = [
    ("O(1)", lambda n: 1),
    ("O(log n)", lambda n: math.log(n)),
    ("O(n)", lambda n: n),
    ("O(n log n)", lambda n: n * math.log(n)),
    ("O(n^2)", lambda n: n * n),
    ("O(n^2 log n)", lambda n: n * n * math.log(n)),
    ("O(n^3)", lambda n: n * n * n),
    ("O(2^n)", lambda n: 2 ** n),
]

best_name = ""
best_err = float('inf')

for name, f in complexities:
    try:
        xs = [f(num) for num, t in data]
        if any(not math.isfinite(x) or x <= 0 for x in xs):
            continue
        sum_xy = sum(t * x for (num, t), x in zip(data, xs))
        sum_x2 = sum(x * x for x in xs)
        if sum_x2 == 0:
            continue
        c = sum_xy / sum_x2
        err = sum((t - c * x) ** 2 for (num, t), x in zip(data, xs))
        if err < best_err:
            best_err = err
            best_name = name
    except (OverflowError, ValueError):
        continue

print(best_name)
