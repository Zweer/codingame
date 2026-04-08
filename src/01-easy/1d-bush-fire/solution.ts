const n = parseInt(readline());
for (let i = 0; i < n; i++) {
    const s = readline(); let d = 0, j = 0;
    while (j < s.length) { if (s[j] === 'f') { d++; j += 3; } else j++; }
    console.log(d);
}
