n = gets.to_i
q = gets.to_i
m = {}
n.times { p = gets.split; m[p[0].downcase] = p[1] }
q.times {
  f = gets.chomp
  dot = f.rindex('.')
  puts dot ? (m[f[dot+1..].downcase] || 'UNKNOWN') : 'UNKNOWN'
}
