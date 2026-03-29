r = int(input())
l = int(input())
seq = [r]
for _ in range(l - 1):
    new = []
    i = 0
    while i < len(seq):
        val = seq[i]
        count = 1
        while i + count < len(seq) and seq[i + count] == val:
            count += 1
        new.extend([count, val])
        i += count
    seq = new
print(' '.join(map(str, seq)))
