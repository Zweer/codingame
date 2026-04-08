<?php
function ds($n){$s=0;while($n>0){$s+=$n%10;$n=intdiv($n,10);}return $s;}
$r1=intval(fgets(STDIN));$r2=intval(fgets(STDIN));
while($r1!=$r2){if($r1<$r2)$r1+=ds($r1);else $r2+=ds($r2);}
echo $r1."\n";
