import sys;sys.setrecursionlimit(9999)
g={};m={}
def f(u):
 if u in m:return m[u]
 m[u]=1+max((f(v)for v in g.get(u,[])),default=0);return m[u]
for _ in[0]*int(input()):a,b=input().split();g.setdefault(a,[]).append(b)
print(max(f(u)for u in set(sum(([a]+g.get(a,[])for a in g),[]))))