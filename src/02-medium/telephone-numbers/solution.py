n = int(input())
trie = {}
count = 0
for _ in range(n):
    phone = input()
    node = trie
    for c in phone:
        if c not in node:
            node[c] = {}
            count += 1
        node = node[c]
print(count)
