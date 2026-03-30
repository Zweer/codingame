local n = tonumber(io.read())
local q = tonumber(io.read())
local m = {}
for i = 1, n do
    local line = io.read()
    local ext, mt = line:match("(%S+)%s+(%S+)")
    m[ext:lower()] = mt
end
for i = 1, q do
    local f = io.read()
    local ext = f:match("%.([^.]+)$")
    if ext then
        local r = m[ext:lower()]
        print(r or "UNKNOWN")
    else
        print("UNKNOWN")
    end
end
