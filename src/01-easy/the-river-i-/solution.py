ds=lambda n:sum(int(c)for c in str(n))
r1,r2=int(input()),int(input())
while r1!=r2:
    if r1<r2:r1+=ds(r1)
    else:r2+=ds(r2)
print(r1)
