import sys
sys.setrecursionlimit(20000)

n = int(input())
rooms = {}
for _ in range(n):
    parts = input().split()
    num, money = int(parts[0]), int(parts[1])
    exits = [int(p) if p != 'E' else 'E' for p in parts[2:]]
    rooms[num] = (money, exits)

memo = {}
def max_money(room):
    if room in memo:
        return memo[room]
    money, exits = rooms[room]
    best = float('-inf')
    for e in exits:
        if e == 'E':
            best = max(best, 0)
        else:
            best = max(best, max_money(e))
    result = -float('inf') if best == float('-inf') else money + best
    memo[room] = result
    return result

print(max_money(0))
