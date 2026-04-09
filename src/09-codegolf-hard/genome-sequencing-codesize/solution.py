n=int(input());S=[input()for _ in[0]*n]
S=[s for s in S if not any(s in t and s!=t for t in S)]
n=len(S)
if n<2:print(len(S[0])if S else 0);exit()
O=[[0]*n for _ in[0]*n]
for i in range(n):
 for j in range(n):
  if i!=j:
   for k in range(1,min(len(S[i]),len(S[j]))+1):
    if S[i][-k:]==S[j][:k]:O[i][j]=k
r=9**9
def f(m,l,c):
 global r
 if m==(1<<n)-1:r=min(r,c);return
 for j in range(n):
  if not m>>j&1:f(m|1<<j,j,c+len(S[j])-O[l][j])
for i in range(n):f(1<<i,i,len(S[i]))
print(r)