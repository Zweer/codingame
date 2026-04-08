import { solve } from './handler.js';

// @ts-expect-error — CodinGame global
const rl = readline;

const checkpointCount = Number.parseInt(rl(), 10);
const checkpoints: Array<{ x: number; y: number }> = [];

for (let i = 0; i < checkpointCount; i++) {
  const [cx, cy] = rl().split(' ').map(Number);
  checkpoints.push({ x: cx, y: cy });
}

while (true) {
  const [cpIndex, x, y, vx, vy, angle] = rl().split(' ').map(Number);
  console.log(solve(checkpoints, cpIndex, x, y, vx, vy, angle));
}
