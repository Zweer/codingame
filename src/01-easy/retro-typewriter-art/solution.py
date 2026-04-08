abbr = {'sp': ' ', 'bS': '\\', 'sQ': "'", 'nl': '\n'}
s = input()
out = ''
for chunk in s.split(' '):
    last2 = chunk[-2:]
    if last2 in abbr:
        ch = abbr[last2]; num = chunk[:-2]
    else:
        ch = chunk[-1]; num = chunk[:-1]
    out += ch * (int(num) if num else 1)
print(out)
