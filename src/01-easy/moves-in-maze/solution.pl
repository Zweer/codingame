$| = 1;
my $C = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
chomp(my $line = <STDIN>); my ($w, $h) = split / /, $line;
my @g; for (1..$h) { chomp(my $l = <STDIN>); push @g, $l; }
my @d; for my $r (0..$h-1) { for my $c (0..$w-1) { $d[$r][$c] = -1; } }
my ($sr, $sc) = (0, 0);
for my $r (0..$h-1) { for my $c (0..$w-1) { ($sr,$sc)=($r,$c) if substr($g[$r],$c,1) eq 'S'; } }
$d[$sr][$sc] = 0;
my @q = ([$sr, $sc]);
my @dr = (0,0,1,-1); my @dc = (1,-1,0,0);
while (@q) {
    my ($r, $c) = @{shift @q};
    for my $i (0..3) {
        my $nr = ($r+$dr[$i]+$h)%$h; my $nc = ($c+$dc[$i]+$w)%$w;
        if (substr($g[$nr],$nc,1) ne '#' && $d[$nr][$nc] == -1) { $d[$nr][$nc] = $d[$r][$c]+1; push @q, [$nr,$nc]; }
    }
}
for my $r (0..$h-1) {
    print join('', map { substr($g[$r],$_,1) eq '#' ? '#' : $d[$r][$_]==-1 ? '.' : substr($C,$d[$r][$_],1) } 0..$w-1), "\n";
}
