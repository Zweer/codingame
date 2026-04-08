import itertools
msg = input()
b = ''.join(f'{ord(c):07b}' for c in msg)
print(' '.join(f"{'0' if k == '1' else '00'} {'0' * len(list(g))}" for k, g in itertools.groupby(b)))
