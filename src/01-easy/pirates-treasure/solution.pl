$| = 1;
my $w = <STDIN>+0; my $h = <STDIN>+0;
my @g; for (0..$h-1) { push @g, [split / /, <STDIN>]; }
my @dx=(-1,-1,-1,0,0,1,1,1); my @dy=(-1,0,1,-1,1,-1,0,1);
for my $y (0..$h-1) { for my $x (0..$w-1) { if ($g[$y][$x]==0) {
    my $ok=1; for my $i (0..7) { my($nx,$ny)=($x+$dx[$i],$y+$dy[$i]);
        $ok=0 if $nx>=0&&$nx<$w&&$ny>=0&&$ny<$h&&$g[$ny][$nx]!=1; }
    if ($ok) { print "$x $y\n"; exit; }
}}}
