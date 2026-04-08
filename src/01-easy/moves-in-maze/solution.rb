STDOUT.sync = true
C = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
w, h = gets.split.map(&:to_i)
g = h.times.map { gets.chomp }
d = Array.new(h) { Array.new(w, -1) }
sr = sc = 0
h.times { |r| w.times { |c| (sr, sc = r, c) if g[r][c] == 'S' } }
d[sr][sc] = 0
q = [[sr, sc]]
while q.any?
    r, c = q.shift
    [[0,1],[0,-1],[1,0],[-1,0]].each do |dr, dc|
        nr, nc = (r+dr) % h, (c+dc) % w
        if g[nr][nc] != '#' && d[nr][nc] == -1
            d[nr][nc] = d[r][c] + 1; q << [nr, nc]
        end
    end
end
h.times { |r| puts (0...w).map { |c| g[r][c] == '#' ? '#' : d[r][c] == -1 ? '.' : C[d[r][c]] }.join }
