local n=tonumber(io.read());local l=tonumber(io.read())
local g={};for i=1,n do g[i]={};local j=1;for v in io.read():gmatch('%S+') do g[i][j]=v;j=j+1 end end
local d=0
for r=1,n do for c=1,n do
    local lit=false
    for r2=1,n do for c2=1,n do
        if g[r2][c2]=='C' and math.max(math.abs(r-r2),math.abs(c-c2))<l then lit=true end
    end end
    if not lit then d=d+1 end
end end
print(d)
