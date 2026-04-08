n = int(input())
for _ in range(n):
    s = input()
    seen = set()
    x = sum(int(c)**2 for c in s)
    while x != 1 and x not in seen:
        seen.add(x)
        x = sum(int(c)**2 for c in str(x))
    print(f"{s} :)" if x == 1 else f"{s} :(")
