import math

n = int(input())
land = [tuple(map(int, input().split())) for _ in range(n)]

flat_left = flat_right = flat_x = flat_y = 0
for i in range(len(land) - 1):
    if land[i][1] == land[i+1][1]:
        flat_left, flat_right = land[i][0], land[i+1][0]
        flat_x = (flat_left + flat_right) // 2
        flat_y = land[i][1]
        break

while True:
    x, y, hs, vs, fuel, rot, pw = map(int, input().split())
    dx = flat_x - x
    dist = y - flat_y
    above = flat_left <= x <= flat_right

    if not above or abs(dx) > 400:
        t_hs = max(-50, min(50, dx * 0.15))
        angle = round(max(-60, min(60, -(t_hs - hs) * 1.5)))
        thrust = 4
    elif abs(hs) > 15:
        angle = round(max(-60, min(60, hs * 2)))
        thrust = 4
    else:
        angle = 0
        t_vs = -min(40, max(10, dist * 0.04))
        thrust = 4 if vs < t_vs - 5 else 3

    angle = max(-90, min(90, angle))
    thrust = max(0, min(4, thrust))
    print(f"{angle} {thrust}")
