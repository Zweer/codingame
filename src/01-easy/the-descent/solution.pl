use strict;
use warnings;

while (1) {
    my $max = -1;
    my $idx = 0;
    for my $i (0..7) {
        my $h = <STDIN>;
        chomp $h;
        $h = int($h);
        if ($h > $max) { $max = $h; $idx = $i; }
    }
    print $idx, "\n";
}
