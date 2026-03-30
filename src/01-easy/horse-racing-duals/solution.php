<?php
$n = intval(fgets(STDIN));
$h = [];
for ($i = 0; $i < $n; $i++) $h[] = intval(fgets(STDIN));
sort($h);
$min = $h[1] - $h[0];
for ($i = 1; $i < $n - 1; $i++) $min = min($min, $h[$i+1] - $h[$i]);
echo $min . "\n";
