<?php
$n = intval(trim(fgets(STDIN)));
if ($n == 0) { echo "0\n"; exit; }
$t = array_map('intval', explode(' ', trim(fgets(STDIN))));
$r = $t[0];
foreach ($t as $v) {
    if (abs($v) < abs($r) || (abs($v) == abs($r) && $v > 0)) $r = $v;
}
echo $r . "\n";
