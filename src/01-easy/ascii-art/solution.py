L=int(input());H=int(input());T=input().upper()
rows=[input()for _ in range(H)]
for i in range(H):
    line=""
    for c in T:
        idx=ord(c)-65
        if idx<0 or idx>25:idx=26
        line+=rows[i][idx*L:idx*L+L]
    print(line)
