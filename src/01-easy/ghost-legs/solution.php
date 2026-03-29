<?php
fscanf(STDIN, "%d %d", $W, $H);
$lines = [];
for ($i = 0; $i < $H; $i++) {
    $lines[] = rtrim(fgets(STDIN), "\n");
}
// Extract top labels
$topLabels = [];
for ($i = 0; $i < strlen($lines[0]); $i++) {
    if ($lines[0][$i] !== ' ') $topLabels[] = ['label' => $lines[0][$i], 'col' => $i];
}
// Extract bottom labels
$bottomLabels = [];
$last = $lines[$H - 1];
for ($i = 0; $i < strlen($last); $i++) {
    if ($last[$i] !== ' ') $bottomLabels[$i] = $last[$i];
}
// Trace each path
foreach ($topLabels as $info) {
    $col = $info['col'];
    for ($r = 1; $r < $H - 1; $r++) {
        if ($col + 2 < $W && isset($lines[$r][$col + 1]) && $lines[$r][$col + 1] === '-') {
            $col += 3;
        } elseif ($col - 2 >= 0 && isset($lines[$r][$col - 1]) && $lines[$r][$col - 1] === '-') {
            $col -= 3;
        }
    }
    echo $info['label'] . $bottomLabels[$col] . "\n";
}
