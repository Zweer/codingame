local w=tonumber(io.read());local h=tonumber(io.read())
local g={};for y=1,h do g[y]={};local i=1;for v in io.read():gmatch('%d+') do g[y][i]=tonumber(v);i=i+1 end end
local dx={-1,-1,-1,0,0,1,1,1};local dy={-1,0,1,-1,1,-1,0,1}
for y=1,h do for x=1,w do if g[y][x]==0 then
    local ok=true
    for i=1,8 do local nx,ny=x+dx[i],y+dy[i]
        if nx>=1 and nx<=w and ny>=1 and ny<=h and g[ny][nx]~=1 then ok=false end end
    if ok then print((x-1)..' '..(y-1));os.exit() end
end end end
