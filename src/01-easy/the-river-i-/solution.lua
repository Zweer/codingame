function ds(n) local s=0; while n>0 do s=s+n%10; n=math.floor(n/10) end; return s end
local r1=tonumber(io.read())
local r2=tonumber(io.read())
while r1~=r2 do if r1<r2 then r1=r1+ds(r1) else r2=r2+ds(r2) end end
print(r1)
