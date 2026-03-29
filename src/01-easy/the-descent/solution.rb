loop do
    heights = 8.times.map { gets.to_i }
    puts heights.index(heights.max)
end
