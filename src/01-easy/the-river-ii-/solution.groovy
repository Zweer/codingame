def ds = { long n -> def s=0L; while(n>0){s+=n%10;n=n.intdiv(10)}; s }
long r = new Scanner(System.in).nextLong()
long lo = Math.max(1L, r-45)
println((lo..<r).any{it+ds(it)==r} ? "YES" : "NO")
