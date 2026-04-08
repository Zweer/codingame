<?php
$n = intval(trim(fgets(STDIN)));
for ($i = 0; $i < $n; $i++) {
    $s = trim(fgets(STDIN)); $d = 0; $j = 0;
    while ($j < strlen($s)) { if ($s[$j] === 'f') { $d++; $j += 3; } else $j++; }
    echo "$d\n";
}
