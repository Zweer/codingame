<?php
$n=intval(trim(fgets(STDIN)));$l=intval(trim(fgets(STDIN)));
$g=[];for($i=0;$i<$n;$i++) $g[]=explode(' ',trim(fgets(STDIN)));
$d=0;
for($r=0;$r<$n;$r++) for($c=0;$c<$n;$c++){$lit=false;
    for($r2=0;$r2<$n&&!$lit;$r2++) for($c2=0;$c2<$n&&!$lit;$c2++)
        if($g[$r2][$c2]==='C'&&max(abs($r-$r2),abs($c-$c2))<$l) $lit=true;
    if(!$lit) $d++;}
echo "$d\n";
