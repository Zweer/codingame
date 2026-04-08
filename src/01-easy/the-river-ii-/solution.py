ds=lambda n:sum(int(c)for c in str(n))
r=int(input())
print("YES"if any(x+ds(x)==r for x in range(max(1,r-45),r))else"NO")
