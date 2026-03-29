STDOUT.sync = true
n = gets.to_i
if n == 0
    puts 0
else
    t = gets.split.map(&:to_i)
    r = t[0]
    t.each { |v| r = v if v.abs < r.abs || (v.abs == r.abs && v > 0) }
    puts r
end
