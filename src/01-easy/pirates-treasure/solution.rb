STDOUT.sync=true
w=gets.to_i;h=gets.to_i
g=h.times.map{gets.split.map(&:to_i)}
dx=[-1,-1,-1,0,0,1,1,1];dy=[-1,0,1,-1,1,-1,0,1]
h.times{|y| w.times{|x| if g[y][x]==0
    ok=8.times.all?{|i| nx=x+dx[i];ny=y+dy[i];nx<0||nx>=w||ny<0||ny>=h||g[ny][nx]==1}
    if ok;puts "#{x} #{y}";exit;end
end}}
