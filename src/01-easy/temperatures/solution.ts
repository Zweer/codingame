const n = parseInt(readline());
if (n === 0) { console.log(0); } else {
    const t = readline().split(' ').map(Number);
    let r = t[0];
    for (const v of t) { if (Math.abs(v) < Math.abs(r) || (Math.abs(v) === Math.abs(r) && v > 0)) r = v; }
    console.log(r);
}
