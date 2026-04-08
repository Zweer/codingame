$| = 1;
my $n = <STDIN>+0;
for (1..$n) {
    chomp(my $s = <STDIN>); my $d = 0; my $j = 0;
    while ($j < length($s)) { if (substr($s,$j,1) eq 'f') { $d++; $j+=3; } else { $j++; } }
    print "$d\n";
}
