$| = 1;
my $n = <STDIN>; chomp $n;
for (1..$n) {
    chomp(my $s = <STDIN>);
    my $x = 0; $x += $_**2 for split //, $s;
    my %seen;
    while ($x != 1 && !$seen{$x}++) {
        my $t = 0; $t += $_**2 for split //, $x; $x = $t;
    }
    print "$s " . ($x == 1 ? ":)" : ":(") . "\n";
}
