chomp(my $n = <STDIN>);
my @h;
for (1..$n) { chomp(my $x = <STDIN>); push @h, $x + 0; }
@h = sort { $a <=> $b } @h;
my $min = $h[1] - $h[0];
for my $i (1..$#h-1) {
    my $d = $h[$i+1] - $h[$i];
    $min = $d if $d < $min;
}
print "$min\n";
