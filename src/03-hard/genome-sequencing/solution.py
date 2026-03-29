from itertools import permutations

n = int(input())
seqs = [input() for _ in range(n)]

# Remove subsequences contained in others
filtered = []
for s in seqs:
    if not any(s != o and s in o for o in seqs):
        filtered.append(s)
seqs = filtered

def overlap(a, b):
    """Max overlap where end of a matches start of b."""
    for i in range(min(len(a), len(b)), 0, -1):
        if a.endswith(b[:i]):
            return i
    return 0

def merge(order):
    result = order[0]
    for i in range(1, len(order)):
        ov = overlap(result, order[i])
        result += order[i][ov:]
    return len(result)

best = sum(len(s) for s in seqs)
for perm in permutations(seqs):
    best = min(best, merge(perm))
print(best)
