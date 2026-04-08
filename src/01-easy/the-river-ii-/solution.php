<?php
function ds($n){$s=0;while($n>0){$s+=$n%10;$n=intdiv($n,10);}return $s;}
$r=intval(fgets(STDIN));
$lo=max(1,$r-45);
for($x=$lo;$x<$r;$x++)if($x+ds($x)==$r){echo "YES\n";exit;}
echo "NO\n";
