def ds(n) n.digits.sum end
r=gets.to_i
puts ([*[1,r-45].max...r].any?{|x|x+ds(x)==r} ? "YES" : "NO")
