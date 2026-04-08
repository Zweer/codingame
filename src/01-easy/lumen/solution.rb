STDOUT.sync=true
n=gets.to_i;l=gets.to_i
g=n.times.map{gets.split}
d=0
n.times{|r| n.times{|c|
    lit=false
    n.times{|r2| n.times{|c2| lit=true if g[r2][c2]=='C'&&[((r-r2).abs),((c-c2).abs)].max<l}}
    d+=1 unless lit
}}
puts d
