<?php
$ab = ['sp'=>' ','bS'=>'\\','sQ'=>"'",'nl'=>"\n"];
$line = trim(fgets(STDIN));
$out = '';
foreach(explode(' ', $line) as $tok){
    $l2 = substr($tok, -2);
    if(isset($ab[$l2])){ $ch=$ab[$l2]; $num=substr($tok,0,-2); }
    else{ $ch=substr($tok,-1); $num=substr($tok,0,-1); }
    $n = $num===''||$num===false ? 1 : max(1,intval($num));
    $out .= str_repeat($ch, $n);
}
echo $out."\n";
