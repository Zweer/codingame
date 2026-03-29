E = {
    1:  {'TOP': (0,1), 'LEFT': (0,1), 'RIGHT': (0,1)},
    2:  {'LEFT': (1,0), 'RIGHT': (-1,0)},
    3:  {'TOP': (0,1)},
    4:  {'TOP': (-1,0), 'RIGHT': (0,1)},
    5:  {'TOP': (1,0), 'LEFT': (0,1)},
    6:  {'LEFT': (1,0), 'RIGHT': (-1,0)},
    7:  {'TOP': (0,1), 'RIGHT': (0,1)},
    8:  {'LEFT': (0,1), 'RIGHT': (0,1)},
    9:  {'TOP': (0,1), 'LEFT': (0,1)},
    10: {'TOP': (-1,0)},
    11: {'TOP': (1,0)},
    12: {'RIGHT': (0,1)},
    13: {'LEFT': (0,1)},
}

w, h = map(int, input().split())
grid = [list(map(int, input().split())) for _ in range(h)]
input()  # EX

while True:
    parts = input().split()
    x, y, pos = int(parts[0]), int(parts[1]), parts[2]
    room = abs(grid[y][x])
    if room in E and pos in E[room]:
        dx, dy = E[room][pos]
        print(f"{x+dx} {y+dy}")
