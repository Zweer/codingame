func ds(_ n:Int)->Int{var x=n,s=0;while x>0{s+=x%10;x/=10};return s}
let r=Int(readLine()!)!
let lo=max(1,r-45)
print((lo..<r).contains{$0+ds($0)==r} ? "YES" : "NO")
