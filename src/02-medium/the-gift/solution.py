n = int(input())
c = int(input())
budgets = sorted(int(input()) for _ in range(n))

if sum(budgets) < c:
    print("IMPOSSIBLE")
else:
    remaining = c
    payments = [0] * n
    for i in range(n):
        fair = remaining // (n - i)
        pay = min(budgets[i], fair)
        payments[i] = pay
        remaining -= pay
    for p in payments:
        print(p)
