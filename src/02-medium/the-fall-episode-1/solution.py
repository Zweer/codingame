import sys

# Room type -> entry direction -> (dy, dx) exit offset
exits = {
    1: {'TOP': (1,0), 'LEFT': (1,0), 'RIGHT': (1,0)},
    2: {'LEFT': (0,1), 'RIGHT': (0,-1)},
    3: {'TOP': (1,0)},
    4: {'TOP': (0,-1), 'RIGHT': (1,0)},
    5: {'TOP': (0,1), 'LEFT': (1,0)},
    6: {'LEFT': (0,1), 'RIGHT': (0,-1)},
    7: {'TOP': (1,0), 'RIGHT': (1,0)},
    8: {'LEFT': (1,0), 'RIGHT': (1,0)},
    9: {'TOP': (1,0), 'LEFT': (1,0)},
    10: {'TOP': (0,-1)},
    11: {'TOP': (0,1)},
    12: {'RIGHT': (1,0)},
    13: {'LEFT': (1,0)},
}

w, h = map(int, input().split())
grid = []
for _ in range(h):
    grid.append(list(map(int, input().split())))

while True:
    xi, yi, pos = input().split()
    x, y = int(xi), int(yi)
    room = grid[y][x]
    if room in exits and pos in exits[room]:
        dy, dx = exits[room][pos]
        nx, ny = x + dx, y + dy
        print(f"{nx} {ny}")
    # Determine entry direction for next room
    # This is handled by CodinGame giving us pos each turn
