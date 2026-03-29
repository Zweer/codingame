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
indent = 0
lines = []
i = 0
while i < len(tokens):
    t = tokens[i]
    if t == '(':
        lines.append(' ' * indent + '(')
        indent += 4
        i += 1
    elif t == ')':
        indent -= 4
        lines.append(' ' * indent + ')')
        i += 1
    elif i + 1 < len(tokens) and tokens[i+1] == '=':
        # key=value pair
        line = t + '='
        i += 2  # skip key and =
        if i < len(tokens) and tokens[i] not in ('(', ')', ';'):
            line += tokens[i]
            i += 1
            if i < len(tokens) and tokens[i] == ';':
                line += ';'
                i += 1
            lines.append(' ' * indent + line)
        elif i < len(tokens) and tokens[i] == '(':
            lines.append(' ' * indent + line)
            # ( will be handled next iteration
        else:
            lines.append(' ' * indent + line)
    else:
        line = t
        i += 1
        if i < len(tokens) and tokens[i] == ';':
            line += ';'
            i += 1
        lines.append(' ' * indent + line)

print('\n'.join(lines))
