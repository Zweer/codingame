local C = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
local w, h = io.read('*l'):match('(%d+) (%d+)'); w=tonumber(w); h=tonumber(h)
local g = {}; for i=1,h do g[i]=io.read('*l') end
local d = {}; for r=1,h do d[r]={}; for c=1,w do d[r][c]=-1 end end
local sr, sc = 1, 1
for r=1,h do for c=1,w do if g[r]:sub(c,c)=='S' then sr,sc=r,c end end end
d[sr][sc]=0
local q={{sr,sc}}; local qi=1
local dr={0,0,1,-1}; local dc={1,-1,0,0}
while qi <= #q do
    local r,c=q[qi][1],q[qi][2]; qi=qi+1
    for i=1,4 do
        local nr=((r-1+dr[i])%h)+1; local nc=((c-1+dc[i])%w)+1
        if g[nr]:sub(nc,nc)~='#' and d[nr][nc]==-1 then d[nr][nc]=d[r][c]+1; q[#q+1]={nr,nc} end
    end
end
for r=1,h do
    local s={}; for c=1,w do
        if g[r]:sub(c,c)=='#' then s[c]='#' elseif d[r][c]==-1 then s[c]='.' else s[c]=C:sub(d[r][c]+1,d[r][c]+1) end
    end; print(table.concat(s))
end
