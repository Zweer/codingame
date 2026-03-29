from collections import defaultdict
import sys
sys.setrecursionlimit(100000)

n = int(input())
children = defaultdict(list)
for _ in range(n):
    x, y = map(int, input().split())
    children[x].append(y)

memo = {}
def depth(node):
    if node in memo:
        return memo[node]
    if not children[node]:
        memo[node] = 1
        return 1
    memo[node] = 1 + max(depth(c) for c in children[node])
    return memo[node]

all_nodes = set()
for _ in children:
    all_nodes.add(_)
    for c in children[_]:
        all_nodes.add(c)

print(max(depth(node) for node in all_nodes))
