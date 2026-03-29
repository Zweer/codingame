$| = 1;
chomp(my $line = <STDIN>);
my ($lx, $ly, $tx, $ty) = split / /, $line;
while (1) {
    <STDIN>;
    my $dir = "";
    if ($ty > $ly) { $dir .= "N"; $ty--; }
    elsif ($ty < $ly) { $dir .= "S"; $ty++; }
    if ($tx > $lx) { $dir .= "W"; $tx--; }
    elsif ($tx < $lx) { $dir .= "E"; $tx++; }
    print "$dir\n";
}
