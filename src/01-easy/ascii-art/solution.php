<?php
$L=intval(fgets(STDIN));$H=intval(fgets(STDIN));$T=strtoupper(trim(fgets(STDIN)));
$rows=[];for($i=0;$i<$H;$i++)$rows[]=rtrim(fgets(STDIN),"\n");
for($i=0;$i<$H;$i++){
    $line="";
    for($j=0;$j<strlen($T);$j++){
        $idx=ord($T[$j])-65;if($idx<0||$idx>25)$idx=26;
        $line.=substr($rows[$i],$idx*$L,$L);
    }
    echo $line."\n";
}
