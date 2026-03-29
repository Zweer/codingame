from collections import Counter

scores = {'e':1,'a':1,'i':1,'o':1,'n':1,'r':1,'t':1,'l':1,'s':1,'u':1,
          'd':2,'g':2,'b':3,'c':3,'m':3,'p':3,'f':4,'h':4,'v':4,'w':4,
          'y':4,'k':5,'j':8,'x':8,'q':10,'z':10}

n = int(input())
words = [input() for _ in range(n)]
letters = Counter(input())

best_word = ""
best_score = -1
for word in words:
    wc = Counter(word)
    if all(wc[c] <= letters[c] for c in wc):
        s = sum(scores.get(c, 0) * wc[c] for c in wc)
        if s > best_score:
            best_score = s
            best_word = word
print(best_word)
