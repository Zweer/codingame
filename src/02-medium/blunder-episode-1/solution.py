import sys

n, m = map(int, input().split())
grid = [list(input()) for _ in range(n)]

dirs = {'S': (1,0), 'E': (0,1), 'N': (-1,0), 'W': (0,-1)}
priorities = ['S','E','N','W']
inv_priorities = ['W','N','E','S']

start = end = None
teleporters = []
for r in range(n):
    for c in range(m):
        if grid[r][c] == '@': start = (r, c)
        elif grid[r][c] == '$': end = (r, c)
        elif grid[r][c] == 'T': teleporters.append((r, c))

r, c = start
d = 'S'
breaker = False
inverted = False
moves = []
states = set()

while True:
    if (r, c) == end:
        break
    state = (r, c, d, breaker, inverted, tuple(tuple(row) for row in grid))
    if state in states:
        print("LOOP")
        sys.exit()
    states.add(state)

    ch = grid[r][c]
    if ch in 'SENW': d = ch
    elif ch == 'B': breaker = not breaker
    elif ch == 'I': inverted = not inverted
    elif ch == 'T':
        for tr, tc in teleporters:
            if (tr, tc) != (r, c):
                r, c = tr, tc
                break

    prio = inv_priorities if inverted else priorities
    moved = False
    # Try current direction first
    dr, dc = dirs[d]
    nr, nc = r + dr, c + dc
    cell = grid[nr][nc]
    if cell != '#' and (cell != 'X' or breaker):
        if cell == 'X' and breaker:
            grid[nr][nc] = ' '
        r, c = nr, nc
        moves.append({'S':'SOUTH','E':'EAST','N':'NORTH','W':'WEST'}[d])
        continue

    for pd in prio:
        dr, dc = dirs[pd]
        nr, nc = r + dr, c + dc
        cell = grid[nr][nc]
        if cell != '#' and (cell != 'X' or breaker):
            if cell == 'X' and breaker:
                grid[nr][nc] = ' '
            d = pd
            r, c = nr, nc
            moves.append({'S':'SOUTH','E':'EAST','N':'NORTH','W':'WEST'}[d])
            moved = True
            break

print('\n'.join(moves))
