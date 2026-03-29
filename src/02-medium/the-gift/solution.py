n = int(input())
c = int(input())
budgets = sorted(int(input()) for _ in range(n))

if sum(budgets) < c:
    print("IMPOSSIBLE")
else:
    payments = [0] * n
    remaining = c
    for i in range(n):
        fair = remaining // (n - i)
        pay = min(budgets[i], fair)
        payments[i] = pay
        remaining -= pay
    # Distribute leftover from floor rounding
    for i in range(n - 1, -1, -1):
        if remaining <= 0:
            break
        add = min(remaining, budgets[i] - payments[i])
        payments[i] += add
        remaining -= add
    for p in payments:
        print(p)
