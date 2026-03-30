n = int(input())
horses = sorted(int(input()) for _ in range(n))
print(min(horses[i+1] - horses[i] for i in range(n-1)))
