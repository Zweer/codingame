import sys

n = int(input())
raw = ''.join(input() for _ in range(n))

lines = []
buf = ""
indent = 0
in_str = False
after_eq = False
needs_nl = False

for ch in raw:
    if in_str:
        buf += ch
        if ch == "'":
            in_str = False
        continue
    if ch in ' \t\n\r':
        continue

    start_nl = False
    if ch == '(':
        start_nl = True
    elif ch == "'" and not after_eq:
        start_nl = True
    elif needs_nl and not after_eq and ch not in '();=':
        start_nl = True

    if start_nl and buf:
        lines.append(' ' * indent + buf)
        buf = ""

    if ch == "'":
        buf += ch
        in_str = True
        after_eq = False
        needs_nl = False
    elif ch == '(':
        lines.append(' ' * indent + ch)
        indent += 4
        buf = ""
        after_eq = False
        needs_nl = True
    elif ch == ')':
        if buf:
            lines.append(' ' * indent + buf)
            buf = ""
        indent -= 4
        lines.append(' ' * indent + ch)
        after_eq = False
        needs_nl = True
    elif ch == '=':
        buf += ch
        after_eq = True
        needs_nl = False
    elif ch == ';':
        buf += ch
        lines.append(' ' * indent + buf)
        buf = ""
        after_eq = False
        needs_nl = True
    else:
        buf += ch
        after_eq = False
        needs_nl = False

if buf:
    lines.append(' ' * indent + buf)

print('\n'.join(lines))
