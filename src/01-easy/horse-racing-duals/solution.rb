n = gets.to_i
h = n.times.map { gets.to_i }.sort
puts h.each_cons(2).map { |a, b| b - a }.min
