t={};c=0
for _ in[0]*int(input()):
 n=t
 for d in input():
  if d not in n:n[d]={};c+=1
  n=n[d]
print(c)