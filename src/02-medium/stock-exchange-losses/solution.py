n = int(input())
values = list(map(int, input().split()))
max_price = values[0]
max_loss = 0
for v in values[1:]:
    max_loss = min(max_loss, v - max_price)
    max_price = max(max_price, v)
print(max_loss)
