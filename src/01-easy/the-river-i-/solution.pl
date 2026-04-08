sub ds { my $n=shift; my $s=0; while($n>0){$s+=$n%10;$n=int($n/10)} $s }
chomp(my $r1=<STDIN>); chomp(my $r2=<STDIN>);
while($r1!=$r2){if($r1<$r2){$r1+=ds($r1)}else{$r2+=ds($r2)}}
print "$r1\n";
