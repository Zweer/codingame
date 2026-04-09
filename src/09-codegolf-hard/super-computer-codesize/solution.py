n=int(input());t=[]
for _ in[0]*n:j,d=map(int,input().split());t+=[(j+d-1,j)]
t.sort();c=e=0
for a,b in t:
 if b>e:c+=1;e=a
print(c)