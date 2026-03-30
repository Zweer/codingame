n = int(input())
q = int(input())
m = {}
for _ in range(n):
    parts = input().split()
    m[parts[0].lower()] = parts[1]
for _ in range(q):
    f = input()
    dot = f.rfind('.')
    if dot == -1:
        print('UNKNOWN')
    else:
        print(m.get(f[dot+1:].lower(), 'UNKNOWN'))
