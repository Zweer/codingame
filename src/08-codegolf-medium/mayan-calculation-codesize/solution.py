l,h=map(int,input().split())
G=[[]for _ in[0]*20]
for i in range(h):
 r=input()
 for j in range(20):G[j].append(r[j*l:j*l+l])
M={"\n".join(G[i]):i for i in range(20)}
def R():
 s=int(input());L=[input()for _ in[0]*s];v=0
 for i in range(s//h):v=v*20+M["\n".join(L[i*h:i*h+h])]
 return v
a=R();b=R();o=input().replace('/','//');r=eval(f"{a}{o}{b}")
if r==0:print("\n".join(G[0]))
else:
 d=[]
 while r:d+=[r%20];r//=20
 for x in d[::-1]:print("\n".join(G[x]))