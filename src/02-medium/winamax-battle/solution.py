from collections import deque

order = {'2':0,'3':1,'4':2,'5':3,'6':4,'7':5,'8':6,'9':7,'10':8,'J':9,'Q':10,'K':11,'A':12}

def card_value(card):
    return order[card[:-1]]

n1 = int(input())
d1 = deque(input() for _ in range(n1))
n2 = int(input())
d2 = deque(input() for _ in range(n2))

rounds = 0
while d1 and d2:
    pile1, pile2 = [], []
    war = True
    while war:
        if not d1 or not d2:
            print("PAT")
            exit()
        c1, c2 = d1.popleft(), d2.popleft()
        pile1.append(c1)
        pile2.append(c2)
        v1, v2 = card_value(c1), card_value(c2)
        if v1 > v2:
            d1.extend(pile1 + pile2)
            war = False
        elif v2 > v1:
            d2.extend(pile1 + pile2)
            war = False
        else:
            # War: each player puts 3 cards face down
            for _ in range(3):
                if not d1 or not d2:
                    print("PAT")
                    exit()
                pile1.append(d1.popleft())
                pile2.append(d2.popleft())
    rounds += 1

if d1:
    print(f"1 {rounds}")
else:
    print(f"2 {rounds}")
