n=int(input());l=int(input())
g=[input().split() for _ in range(n)]
d=0
for r in range(n):
    for c in range(n):
        if not any(g[r2][c2]=='C' and max(abs(r-r2),abs(c-c2))<l for r2 in range(n) for c2 in range(n)):
            d+=1
print(d)
