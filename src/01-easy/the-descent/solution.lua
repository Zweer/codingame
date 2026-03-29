while true do
    local max, idx = -1, 0
    for i = 0, 7 do
        local h = tonumber(io.read())
        if h > max then max = h; idx = i end
    end
    print(idx)
end
