local n = tonumber(io.read())
for i = 1, n do
    local s = io.read()
    local x = 0
    for j = 1, #s do local d = s:byte(j) - 48; x = x + d*d end
    local seen = {}
    while x ~= 1 and not seen[x] do
        seen[x] = true
        local t = 0
        while x > 0 do local d = x % 10; t = t + d*d; x = math.floor(x/10) end
        x = t
    end
    print(s .. (x == 1 and " :)" or " :("))
end
