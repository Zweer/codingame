def ds(n) n.digits.sum end
r1,r2=gets.to_i,gets.to_i
while r1!=r2; r1<r2 ? r1+=ds(r1) : r2+=ds(r2) end
puts r1
