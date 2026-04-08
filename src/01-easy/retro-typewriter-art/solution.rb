STDOUT.sync = true
ab = {'sp'=>' ','bS'=>'\\','sQ'=>"'",'nl'=>"\n"}
line = gets.strip
out = ''
line.split(' ').each do |tok|
    l2 = tok[-2..]
    if ab.key?(l2)
        ch = ab[l2]; num = tok[0...-2]
    else
        ch = tok[-1]; num = tok[0...-1]
    end
    n = num.empty? ? 1 : [num.to_i, 1].max
    out += ch * n
end
puts out
