n = int(input())
tasks = []
for _ in range(n):
    j, d = map(int, input().split())
    tasks.append((j + d - 1, j))  # (end, start)
tasks.sort()
count = 0
last_end = -1
for end, start in tasks:
    if start > last_end:
        count += 1
        last_end = end
print(count)
