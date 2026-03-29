import sys
input = sys.stdin.readline

l, h = map(int, input().split())
glyphs = [[] for _ in range(20)]
for i in range(h):
    row = input().rstrip('\n')
    for j in range(20):
        glyphs[j].append(row[j*l:(j+1)*l])

glyph_to_val = {}
for i in range(20):
    glyph_to_val['\n'.join(glyphs[i])] = i

def read_mayan():
    s = int(input())
    lines = [input().rstrip('\n') for _ in range(s)]
    val = 0
    for i in range(s // h):
        key = '\n'.join(lines[i*h:(i+1)*h])
        val = val * 20 + glyph_to_val[key]
    return val

a = read_mayan()
b = read_mayan()
op = input().strip()
r = {'+': a+b, '-': a-b, '*': a*b, '/': a//b}[op]

digits = []
if r == 0:
    digits = [0]
else:
    while r > 0:
        digits.append(r % 20)
        r //= 20
for d in reversed(digits):
    print('\n'.join(glyphs[d]))
