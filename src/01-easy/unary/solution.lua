local msg = io.read()
local bin = ""
for i = 1, #msg do
    local n = msg:byte(i)
    local b = ""
    for j = 6, 0, -1 do
        b = b .. (math.floor(n / 2^j) % 2)
    end
    bin = bin .. b
end
local parts = {}
local i = 1
while i <= #bin do
    local cur = bin:sub(i, i)
    local count = 0
    while i <= #bin and bin:sub(i, i) == cur do count = count + 1; i = i + 1 end
    parts[#parts + 1] = (cur == "1" and "0" or "00") .. " " .. string.rep("0", count)
end
print(table.concat(parts, " "))
