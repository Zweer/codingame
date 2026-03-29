local s = io.read()
local lx, ly, tx, ty = s:match("(%d+) (%d+) (%d+) (%d+)")
lx, ly, tx, ty = tonumber(lx), tonumber(ly), tonumber(tx), tonumber(ty)
while true do
    io.read()
    local dir = ""
    if ty > ly then dir = dir.."N"; ty = ty-1
    elseif ty < ly then dir = dir.."S"; ty = ty+1 end
    if tx > lx then dir = dir.."W"; tx = tx-1
    elseif tx < lx then dir = dir.."E"; tx = tx+1 end
    print(dir)
end
