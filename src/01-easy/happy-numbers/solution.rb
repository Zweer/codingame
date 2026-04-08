STDOUT.sync = true
n = gets.to_i
n.times do
    s = gets.strip
    x = s.chars.sum { |c| (c.ord - 48) ** 2 }
    seen = {}
    while x != 1 && !seen[x]
        seen[x] = true
        x = x.digits.sum { |d| d ** 2 }
    end
    puts "#{s} #{x == 1 ? ':)' : ':('}"
end
