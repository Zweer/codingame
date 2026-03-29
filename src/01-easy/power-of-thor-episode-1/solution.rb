STDOUT.sync = true
lx, ly, tx, ty = gets.split.map(&:to_i)
loop do
    gets
    dir = ""
    if ty > ly then dir += "N"; ty -= 1
    elsif ty < ly then dir += "S"; ty += 1 end
    if tx > lx then dir += "W"; tx -= 1
    elsif tx < lx then dir += "E"; tx += 1 end
    puts dir
end
