L, C, N = map(int, input().split())
groups = [int(input()) for _ in range(N)]

total = 0
rides = 0
head = 0
memo = {}

while rides < C:
    if head in memo:
        prev_rides, prev_total = memo[head]
        cycle_len = rides - prev_rides
        cycle_earn = total - prev_total
        remaining = C - rides
        full_cycles = remaining // cycle_len
        total += full_cycles * cycle_earn
        rides += full_cycles * cycle_len
        break
    memo[head] = (rides, total)

    cap = L
    earned = 0
    idx = head
    for _ in range(N):
        if groups[idx] <= cap:
            cap -= groups[idx]
            earned += groups[idx]
            idx = (idx + 1) % N
        else:
            break
    total += earned
    rides += 1
    head = idx

# Simulate remaining rides after cycle skip
while rides < C:
    cap = L
    earned = 0
    idx = head
    for _ in range(N):
        if groups[idx] <= cap:
            cap -= groups[idx]
            earned += groups[idx]
            idx = (idx + 1) % N
        else:
            break
    total += earned
    rides += 1
    head = idx

print(total)
