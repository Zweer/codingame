$| = 1;
while (1) {
    my $max = -1;
    my $idx = 0;
    for my $i (0..7) {
        chomp(my $h = <STDIN>);
        if ($h + 0 > $max) { $max = $h + 0; $idx = $i; }
    }
    print "$idx\n";
}
