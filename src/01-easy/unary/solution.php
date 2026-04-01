<?php
$msg = trim(fgets(STDIN));
$bin = '';
for ($i = 0; $i < strlen($msg); $i++)
    $bin .= str_pad(decbin(ord($msg[$i])), 7, '0', STR_PAD_LEFT);
$parts = [];
$i = 0;
while ($i < strlen($bin)) {
    $cur = $bin[$i];
    $count = 0;
    while ($i < strlen($bin) && $bin[$i] === $cur) { $count++; $i++; }
    $parts[] = ($cur === '1' ? '0' : '00') . ' ' . str_repeat('0', $count);
}
echo implode(' ', $parts) . "\n";
