import { initState, step } from './handler.js';

const [W, H] = readline().split(' ').map(Number);
const N = Number(readline());
const [x0, y0] = readline().split(' ').map(Number);
const s = initState(W, H, x0, y0);

console.error(`INIT W=${W} H=${H} N=${N} start=(${x0},${y0})`);

let turn = 0;
while (true) {
  const hint = readline().trim();
  turn++;
  console.error(`T${turn} hint=${hint} pos=(${s.cx},${s.cy}) x=[${s.xLo},${s.xHi}] y=[${s.yLo},${s.yHi}] doX=${s.doingX}`);
  const [nx, ny] = step(s, hint);
  console.error(`  -> (${nx},${ny})`);
  console.log(`${nx} ${ny}`);
}
