l=gets.to_i;h=gets.to_i;t=gets.chomp.upcase
rows=(0...h).map{gets.chomp}
h.times{|i|puts t.chars.map{|c|idx=c.ord-65;idx=26 if idx<0||idx>25;rows[i][idx*l,l]}.join}
