local ab = {sp=' ', bS='\\', sQ="'", nl='\n'}
local line = io.read()
local out = {}
for tok in line:gmatch('%S+') do
    local l2 = #tok >= 2 and tok:sub(-2) or ''
    local ch, num
    if ab[l2] then ch = ab[l2]; num = tok:sub(1, -3)
    else ch = tok:sub(-1); num = tok:sub(1, -2) end
    local n = (#num > 0) and tonumber(num) or 1
    if n < 1 then n = 1 end
    for i = 1, n do out[#out+1] = ch end
end
print(table.concat(out))
