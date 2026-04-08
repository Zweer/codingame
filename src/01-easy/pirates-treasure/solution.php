<?php
$w=intval(trim(fgets(STDIN)));$h=intval(trim(fgets(STDIN)));
$g=[];for($y=0;$y<$h;$y++) $g[]=array_map('intval',explode(' ',trim(fgets(STDIN))));
$dx=[-1,-1,-1,0,0,1,1,1];$dy=[-1,0,1,-1,1,-1,0,1];
for($y=0;$y<$h;$y++) for($x=0;$x<$w;$x++) if($g[$y][$x]===0){
    $ok=true;for($i=0;$i<8;$i++){$nx=$x+$dx[$i];$ny=$y+$dy[$i];if($nx>=0&&$nx<$w&&$ny>=0&&$ny<$h&&$g[$ny][$nx]!==1)$ok=false;}
    if($ok){echo "$x $y\n";exit;}
}
