$| = 1;
my %ab = (sp => ' ', bS => '\\', sQ => "'", nl => "\n");
chomp(my $line = <STDIN>);
my $out = '';
for my $tok (split / /, $line) {
    my ($ch, $num);
    my $l2 = length($tok) >= 2 ? substr($tok, -2) : '';
    if (exists $ab{$l2}) { $ch = $ab{$l2}; $num = substr($tok, 0, length($tok)-2); }
    else { $ch = substr($tok, -1); $num = substr($tok, 0, length($tok)-1); }
    my $n = $num eq '' ? 1 : int($num); $n = 1 if $n < 1;
    $out .= $ch x $n;
}
print "$out\n";
