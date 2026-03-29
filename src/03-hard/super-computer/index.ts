const N = Number(readline());
const tasks: [number, number][] = [];
for (let i = 0; i < N; i++) {
  const [j, d] = readline().split(' ').map(Number);
  tasks.push([j + d - 1, j]); // [end, start]
}
tasks.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
let count = 0, lastEnd = -1;
for (const [end, start] of tasks) {
  if (start > lastEnd) { count++; lastEnd = end; }
}
console.log(count);
