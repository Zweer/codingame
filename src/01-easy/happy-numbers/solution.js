const n = parseInt(readline());
for (let i = 0; i < n; i++) {
    const s = readline();
    const seen = new Set();
    let x = [...s].reduce((a, c) => a + (c.charCodeAt(0) - 48) ** 2, 0);
    while (x !== 1 && !seen.has(x)) { seen.add(x); x = [...String(x)].reduce((a, c) => a + (c.charCodeAt(0) - 48) ** 2, 0); }
    console.log(`${s} ${x === 1 ? ':)' : ':('}`);
}
