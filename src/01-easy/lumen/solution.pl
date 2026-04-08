$| = 1;
my $n = <STDIN>+0; my $l = <STDIN>+0;
my @g; for (0..$n-1) { push @g, [split / /, <STDIN>]; }
my $d = 0;
for my $r (0..$n-1) { for my $c (0..$n-1) { my $lit=0;
    for my $r2 (0..$n-1) { for my $c2 (0..$n-1) {
        my $dr=abs($r-$r2); my $dc=abs($c-$c2); my $mx=$dr>$dc?$dr:$dc;
        $lit=1 if $g[$r2][$c2] eq 'C' && $mx < $l;
    }}
    $d++ unless $lit;
}}
print "$d\n";
