$| = 1;
chomp(my $n = <STDIN>);
if ($n == 0) { print "0\n"; exit; }
chomp(my $line = <STDIN>);
my @t = split / /, $line;
my $r = $t[0];
for my $v (@t) {
    if (abs($v) < abs($r) || (abs($v) == abs($r) && $v > 0)) { $r = $v; }
}
print "$r\n";
sub abs { $_[0] < 0 ? -$_[0] : $_[0] }
