from collections import deque
C = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
_, h = map(int, input().split())
g = [input() for _ in range(h)]
w = len(g[0])
d = [[-1]*w for _ in range(h)]
sr = sc = 0
for r in range(h):
    for c in range(w):
        if g[r][c] == 'S': sr, sc = r, c
d[sr][sc] = 0
q = deque([(sr, sc)])
while q:
    r, c = q.popleft()
    for dr, dc in ((0,1),(0,-1),(1,0),(-1,0)):
        nr, nc = (r+dr)%h, (c+dc)%w
        if g[nr][nc] != '#' and d[nr][nc] == -1:
            d[nr][nc] = d[r][c] + 1
            q.append((nr, nc))
for r in range(h):
    print(''.join('#' if g[r][c]=='#' else '.' if d[r][c]==-1 else C[d[r][c]] for c in range(w)))
