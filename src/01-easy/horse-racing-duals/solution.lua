local n = tonumber(io.read())
local h = {}
for i = 1, n do h[i] = tonumber(io.read()) end
table.sort(h)
local min = h[2] - h[1]
for i = 2, n - 1 do
    local d = h[i+1] - h[i]
    if d < min then min = d end
end
print(min)
