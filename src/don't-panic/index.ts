const [h, w, r, ex, ey, c, _, ec] = readline().split(' ').map(Number);
const e = Array(ec).fill(1).map((e) => readline().split(' ').map(Number));

console.error(h, w, r, ex, ey, c, e);
