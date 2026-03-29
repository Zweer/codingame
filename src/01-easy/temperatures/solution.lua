local n = tonumber(io.read())
if n == 0 then print(0) else
    local t = {}
    for w in io.read():gmatch("%-?%d+") do t[#t+1] = tonumber(w) end
    local r = t[1]
    for _, v in ipairs(t) do
        if math.abs(v) < math.abs(r) or (math.abs(v) == math.abs(r) and v > 0) then r = v end
    end
    print(r)
end
