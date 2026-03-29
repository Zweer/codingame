import math

n = int(input())
land = [tuple(map(int, input().split())) for _ in range(n)]

flat_l = flat_r = flat_y = 0
for i in range(len(land) - 1):
    if land[i][1] == land[i+1][1]:
        flat_l, flat_r = land[i][0], land[i+1][0]
        flat_y = land[i][1]
        break
flat_x = (flat_l + flat_r) / 2

while True:
    x, y, hs, vs, fuel, rot, pw = map(int, input().split())
    dx = flat_x - x
    dy = y - flat_y
    above = flat_l + 50 < x < flat_r - 50

    if not above:
        desired_hs = max(-60, min(60, dx * 0.3))
        angle = round(-(desired_hs - hs) * 0.7)
        angle = max(-45, min(45, angle))
        thrust = 4 if vs < -20 else 3
    elif abs(hs) > 20:
        angle = round(max(-45, min(45, hs * 1.2)))
        thrust = 4
    else:
        angle = round(max(-15, min(15, hs * 0.5)))
        desired_vs = -3 - math.sqrt(max(0, dy - 20)) * 0.6
        desired_vs = max(-40, desired_vs)
        if vs < desired_vs - 3: thrust = 4
        elif vs > desired_vs + 3: thrust = 2
        else: thrust = 3

    angle = max(-90, min(90, angle))
    thrust = max(0, min(4, thrust))
    print(f"{angle} {thrust}")
