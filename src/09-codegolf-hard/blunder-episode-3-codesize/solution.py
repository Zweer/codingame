import math
n=int(input());D=[]
for _ in[0]*n:a,b=map(int,input().split());D+=[(a,b)]
F=[("O(1)",lambda n:1),("O(log n)",math.log),("O(n)",lambda n:n),("O(n log n)",lambda n:n*math.log(n)),("O(n^2)",lambda n:n*n),("O(n^2 log n)",lambda n:n*n*math.log(n)),("O(n^3)",lambda n:n**3),("O(2^n)",lambda n:2**n)]
best="";be=float('inf')
for name,f in F:
 try:
  xy=sum(t*f(a)for a,t in D);x2=sum(f(a)**2 for a,t in D)
  if x2==0:continue
  c=xy/x2;e=sum((t-c*f(a))**2 for a,t in D)
  if e<be:be=e;best=name
 except:0
print(best)