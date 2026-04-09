M=dict(A='.-',B='-...',C='-.-.',D='-..',E='.',F='..-.',G='--.',H='....',I='..',J='.---',K='-.-',L='.-..',M='--',N='-.',O='---',P='.--.',Q='--.-',R='.-.',S='...',T='-',U='..-',V='...-',W='.--',X='-..-',Y='-.--',Z='--..')
s=input();n=int(input());D={}
for _ in[0]*n:
 w=input();m=''.join(M[c]for c in w);D[m]=D.get(m,0)+1
c={}
def f(i):
 if i==len(s):return 1
 if i in c:return c[i]
 r=0
 for k,v in D.items():
  if s[i:i+len(k)]==k:r+=v*f(i+len(k))
 c[i]=r;return r
print(f(0))