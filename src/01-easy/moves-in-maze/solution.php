<?php
$C = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
[$w, $h] = array_map('intval', explode(' ', trim(fgets(STDIN))));
$g = []; for ($i = 0; $i < $h; $i++) $g[] = trim(fgets(STDIN));
$d = array_fill(0, $h, array_fill(0, $w, -1));
$sr = $sc = 0;
for ($r = 0; $r < $h; $r++) for ($c = 0; $c < $w; $c++) if ($g[$r][$c] === 'S') { $sr = $r; $sc = $c; }
$d[$sr][$sc] = 0;
$q = [[$sr, $sc]]; $qi = 0;
$dirs = [[0,1],[0,-1],[1,0],[-1,0]];
while ($qi < count($q)) {
    [$r, $c] = $q[$qi++];
    foreach ($dirs as [$dr, $dc]) {
        $nr = ($r+$dr+$h)%$h; $nc = ($c+$dc+$w)%$w;
        if ($g[$nr][$nc] !== '#' && $d[$nr][$nc] === -1) { $d[$nr][$nc] = $d[$r][$c]+1; $q[] = [$nr, $nc]; }
    }
}
for ($r = 0; $r < $h; $r++) {
    $s = '';
    for ($c = 0; $c < $w; $c++) $s .= $g[$r][$c] === '#' ? '#' : ($d[$r][$c] === -1 ? '.' : $C[$d[$r][$c]]);
    echo "$s\n";
}
