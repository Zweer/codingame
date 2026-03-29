const n = Number(readline());
const values = readline().split(' ').map(Number);
let maxPrice = values[0];
let maxLoss = 0;
for (let i = 1; i < n; i++) {
  maxLoss = Math.min(maxLoss, values[i] - maxPrice);
  maxPrice = Math.max(maxPrice, values[i]);
}
console.log(maxLoss);
