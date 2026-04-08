w=int(input());h=int(input())
g=[list(map(int,input().split())) for _ in range(h)]
for y in range(h):
    for x in range(w):
        if g[y][x]==0 and all(g[y+dy][x+dx]==1 for dx in(-1,0,1) for dy in(-1,0,1) if(dx or dy)and 0<=x+dx<w and 0<=y+dy<h):
            print(x,y);exit()
