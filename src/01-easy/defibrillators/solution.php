<?php
$lon = deg2rad(floatval(str_replace(',', '.', trim(fgets(STDIN)))));
$lat = deg2rad(floatval(str_replace(',', '.', trim(fgets(STDIN)))));
$n = intval(trim(fgets(STDIN)));
$minDist = PHP_FLOAT_MAX;
$minName = '';
for ($i = 0; $i < $n; $i++) {
    $parts = explode(';', trim(fgets(STDIN)));
    $dLon = deg2rad(floatval(str_replace(',', '.', $parts[4])));
    $dLat = deg2rad(floatval(str_replace(',', '.', $parts[5])));
    $x = ($dLon - $lon) * cos(($lat + $dLat) / 2);
    $y = $dLat - $lat;
    $dist = sqrt($x * $x + $y * $y) * 6371;
    if ($dist < $minDist) {
        $minDist = $dist;
        $minName = $parts[1];
    }
}
echo $minName . "\n";
