def ds = { long n -> def s=0L; while(n>0){s+=n%10;n=n.intdiv(10)}; s }
def sc = new Scanner(System.in)
long r1 = sc.nextLong(), r2 = sc.nextLong()
while(r1!=r2){if(r1<r2)r1+=ds(r1);else r2+=ds(r2)}
println r1
