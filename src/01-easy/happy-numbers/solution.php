<?php
$n = intval(trim(fgets(STDIN)));
for ($i = 0; $i < $n; $i++) {
    $s = trim(fgets(STDIN));
    $x = array_sum(array_map(fn($c) => ($c) ** 2, str_split($s)));
    $seen = [];
    while ($x != 1 && !isset($seen[$x])) { $seen[$x] = 1; $t = 0; while ($x > 0) { $d = $x % 10; $t += $d*$d; $x = intdiv($x, 10); } $x = $t; }
    echo "$s " . ($x == 1 ? ":)" : ":(") . "\n";
}
