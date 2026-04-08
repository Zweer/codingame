sub ds { my $n=shift; my $s=0; while($n>0){$s+=$n%10;$n=int($n/10)} $s }
chomp(my $r=<STDIN>);
my $lo=$r>45?$r-45:1; my $found=0;
for my $x($lo..$r-1){if($x+ds($x)==$r){$found=1;last}}
print $found?"YES\n":"NO\n";
