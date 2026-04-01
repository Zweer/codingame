msg = gets.chomp
bin = msg.chars.map { |c| c.ord.to_s(2).rjust(7, '0') }.join
puts bin.chars.chunk { |b| b }.map { |bit, g| "#{bit == '1' ? '0' : '00'} #{'0' * g.size}" }.join(' ')
