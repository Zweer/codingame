STDOUT.sync = true
n = gets.to_i
n.times do
    s = gets.strip; d = 0; j = 0
    while j < s.length
        if s[j] == 'f'; d += 1; j += 3 else j += 1 end
    end
    puts d
end
