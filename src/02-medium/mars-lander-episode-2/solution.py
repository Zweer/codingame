import math

n = int(input())
land = []
for _ in range(n):
    x, y = map(int, input().split())
    land.append((x, y))

# Find flat ground
flat_x = flat_y = 0
for i in range(len(land) - 1):
    if land[i][1] == land[i+1][1]:
        flat_x = (land[i][0] + land[i+1][0]) // 2
        flat_y = land[i][1]
        break

while True:
    x, y, hs, vs, fuel, rotate, power = map(int, input().split())
    
    dx = flat_x - x
    dy = flat_y - y
    
    # Simple PD controller
    target_angle = 0
    target_power = 4
    
    if abs(dx) > 300:
        # Need to move horizontally
        target_angle = max(-45, min(45, -int(dx * 0.1 + hs * 0.8)))
        target_power = 4
    elif abs(hs) > 20:
        # Slow down horizontal speed
        target_angle = max(-45, min(45, int(hs * 1.5)))
        target_power = 4
    else:
        # Vertical descent
        target_angle = 0
        if vs < -38:
            target_power = 4
        elif vs > -10:
            target_power = 2
        else:
            target_power = 3
    
    print(f"{target_angle} {target_power}")
