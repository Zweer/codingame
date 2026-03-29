import { solve } from './handler.js';

const [, h] = readline().split(' ').map(Number);
const grid: string[] = [];
for (let i = 0; i < h; i++) grid.push(readline());
console.log(solve(grid).join('\n'));
