local n = tonumber(io.read())
for i = 1, n do
    local s = io.read(); local d, j = 0, 1
    while j <= #s do
        if s:sub(j,j) == 'f' then d = d+1; j = j+3 else j = j+1 end
    end
    print(d)
end
