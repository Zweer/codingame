chomp(my $n = <STDIN>);
chomp(my $q = <STDIN>);
my %m;
for (1..$n) {
    chomp(my $l = <STDIN>);
    my ($ext, $mt) = split / /, $l;
    $m{lc $ext} = $mt;
}
for (1..$q) {
    chomp(my $f = <STDIN>);
    if ($f =~ /\.([^.]+)$/) {
        my $ext = lc $1;
        print(exists $m{$ext} ? $m{$ext} : "UNKNOWN");
    } else {
        print "UNKNOWN";
    }
    print "\n";
}
