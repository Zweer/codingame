while (1) {
    my ($max, $idx) = (-1, 0);
    for my $i (0..7) {
        chomp(my $h = <STDIN>);
        if ($h > $max) { $max = $h; $idx = $i; }
    }
    print "$idx\n";
}
