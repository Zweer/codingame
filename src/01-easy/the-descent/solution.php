<?php
while (true) {
    $max = -1; $idx = 0;
    for ($i = 0; $i < 8; $i++) {
        $h = intval(trim(fgets(STDIN)));
        if ($h > $max) { $max = $h; $idx = $i; }
    }
    echo $idx . "\n";
}
