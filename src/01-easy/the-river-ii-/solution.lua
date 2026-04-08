function ds(n) local s=0; while n>0 do s=s+n%10; n=math.floor(n/10) end; return s end
local r=tonumber(io.read())
local lo=math.max(1,r-45)
local found=false
for x=lo,r-1 do if x+ds(x)==r then found=true; break end end
print(found and "YES" or "NO")
