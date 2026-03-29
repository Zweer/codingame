n = int(input())
raw = ''.join(input() for _ in range(n))

# Tokenize
tokens = []
i = 0
while i < len(raw):
    c = raw[i]
    if c in ' \t\n\r':
        i += 1
    elif c == "'":
        j = i + 1
        while j < len(raw) and raw[j] != "'":
            j += 1
        tokens.append(raw[i:j+1])
        i = j + 1
    elif c in '()=;':
        tokens.append(c)
        i += 1
    else:
        j = i
        while j < len(raw) and raw[j] not in " \t\n\r'()=;":
            j += 1
        tokens.append(raw[i:j])
        i = j

# Format
lines = []
indent = 0
t = 0
while t < len(tokens):
    tok = tokens[t]
    if tok == '(':
        lines.append(' ' * indent + '(')
        indent += 4
        t += 1
    elif tok == ')':
        indent -= 4
        if t + 1 < len(tokens) and tokens[t+1] == ';':
            lines.append(' ' * indent + ');')
            t += 2
        else:
            lines.append(' ' * indent + ')')
            t += 1
    elif t + 1 < len(tokens) and tokens[t+1] == '=':
        key = tok
        t += 2
        if t < len(tokens) and tokens[t] == '(':
            lines.append(' ' * indent + key + '=')
        elif t < len(tokens):
            line = key + '=' + tokens[t]
            t += 1
            if t < len(tokens) and tokens[t] == ';':
                line += ';'
                t += 1
            lines.append(' ' * indent + line)
    else:
        line = tok
        t += 1
        if t < len(tokens) and tokens[t] == ';':
            line += ';'
            t += 1
        lines.append(' ' * indent + line)

print('\n'.join(lines))
