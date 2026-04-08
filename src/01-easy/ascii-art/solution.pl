chomp(my $L=<STDIN>); chomp(my $H=<STDIN>); chomp(my $T=uc <STDIN>);
my @rows; for(1..$H){chomp(my $r=<STDIN>);push @rows,$r}
for my $i(0..$H-1){
    for my $c(split//,$T){
        my $idx=ord($c)-65; $idx=26 if $idx<0||$idx>25;
        print substr($rows[$i],$idx*$L,$L);
    }
    print "\n";
}
