from collections import deque
import sys
input = sys.stdin.readline

L = int(input())
H = int(input())
grid = [input().strip() for _ in range(H)]

lake_id = [[-1]*L for _ in range(H)]
lake_size = {}
lid = 0

for y in range(H):
    for x in range(L):
        if grid[y][x] == 'O' and lake_id[y][x] == -1:
            lid += 1
            size = 0
            q = deque([(x, y)])
            lake_id[y][x] = lid
            while q:
                cx, cy = q.popleft()
                size += 1
                for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
                    nx, ny = cx+dx, cy+dy
                    if 0 <= nx < L and 0 <= ny < H and grid[ny][nx] == 'O' and lake_id[ny][nx] == -1:
                        lake_id[ny][nx] = lid
                        q.append((nx, ny))
            lake_size[lid] = size

N = int(input())
out = []
for _ in range(N):
    x, y = map(int, input().split())
    if grid[y][x] == '#':
        out.append('0')
    else:
        out.append(str(lake_size[lake_id[y][x]]))
print('\n'.join(out))
