local L=tonumber(io.read())
local H=tonumber(io.read())
local T=io.read():upper()
local rows={};for i=1,H do rows[i]=io.read() end
for i=1,H do
    local line=""
    for j=1,#T do
        local idx=T:byte(j)-65
        if idx<0 or idx>25 then idx=26 end
        line=line..rows[i]:sub(idx*L+1,idx*L+L)
    end
    print(line)
end
