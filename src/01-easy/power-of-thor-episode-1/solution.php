<?php
fscanf(STDIN, "%d %d %d %d", $lx, $ly, $tx, $ty);
while (true) {
    fscanf(STDIN, "%d", $e);
    $dir = "";
    if ($ty > $ly) { $dir .= "N"; $ty--; }
    elseif ($ty < $ly) { $dir .= "S"; $ty++; }
    if ($tx > $lx) { $dir .= "W"; $tx--; }
    elseif ($tx < $lx) { $dir .= "E"; $tx++; }
    echo $dir . "\n";
}
