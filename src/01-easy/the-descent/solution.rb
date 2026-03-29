STDOUT.sync = true
loop do
    mx = -1
    idx = 0
    8.times do |i|
        h = gets.to_i
        if h > mx
            mx = h
            idx = i
        end
    end
    puts idx
end
