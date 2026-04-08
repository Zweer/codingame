chomp(my $msg = <STDIN>);
my $bin = join '', map { sprintf "%07b", ord } split //, $msg;
my @parts;
while ($bin =~ /((.)(\2*))/g) {
    push @parts, ($2 eq '1' ? '0' : '00') . ' ' . ('0' x length($1));
}
print join(' ', @parts) . "\n";
