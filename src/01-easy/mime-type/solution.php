<?php
$n = intval(fgets(STDIN));
$q = intval(fgets(STDIN));
$m = [];
for ($i = 0; $i < $n; $i++) {
    $p = explode(' ', trim(fgets(STDIN)));
    $m[strtolower($p[0])] = $p[1];
}
for ($i = 0; $i < $q; $i++) {
    $f = trim(fgets(STDIN));
    $dot = strrpos($f, '.');
    if ($dot === false) { echo "UNKNOWN\n"; continue; }
    $ext = strtolower(substr($f, $dot + 1));
    echo (isset($m[$ext]) ? $m[$ext] : 'UNKNOWN') . "\n";
}
