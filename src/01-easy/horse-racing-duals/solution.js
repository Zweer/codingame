const n = parseInt(readline());
const h = [];
for (let i = 0; i < n; i++) h.push(parseInt(readline()));
h.sort((a, b) => a - b);
let min = h[1] - h[0];
for (let i = 1; i < n - 1; i++) {
    const d = h[i + 1] - h[i];
    if (d < min) min = d;
}
console.log(min);
