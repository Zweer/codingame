const [W, H] = readline().split(' ').map(Number);
const N = Number(readline());
let [cx, cy] = readline().split(' ').map(Number);

let xLo = 0, xHi = W - 1, yLo = 0, yHi = H - 1;
let px = cx, py = cy;
let doingX = true;
let turn = 0;

const D = (...args: unknown[]) => console.error(`[T${turn}]`, ...args);

D(`Init: W=${W} H=${H} N=${N} start=(${cx},${cy})`);

while (true) {
  const hint = readline().trim();
  turn++;

  D(`hint=${hint} prev=(${px},${py}) cur=(${cx},${cy}) doingX=${doingX}`);
  D(`  before: x=[${xLo},${xHi}] y=[${yLo},${yHi}]`);

  if (hint !== 'UNKNOWN') {
    if (doingX && cy === py) {
      const mid = (px + cx) / 2;
      D(`  X bisect: mid=${mid} px=${px} cx=${cx}`);
      if (hint === 'SAME') {
        xLo = xHi = Math.round(mid);
      } else if ((hint === 'WARMER' && cx > px) || (hint === 'COLDER' && cx < px)) {
        xLo = Math.max(xLo, Math.floor(mid) + 1);
      } else {
        xHi = Math.min(xHi, Math.ceil(mid) - 1);
      }
    } else if (!doingX && cx === px) {
      const mid = (py + cy) / 2;
      D(`  Y bisect: mid=${mid} py=${py} cy=${cy}`);
      if (hint === 'SAME') {
        yLo = yHi = Math.round(mid);
      } else if ((hint === 'WARMER' && cy > py) || (hint === 'COLDER' && cy < py)) {
        yLo = Math.max(yLo, Math.floor(mid) + 1);
      } else {
        yHi = Math.min(yHi, Math.ceil(mid) - 1);
      }
    } else {
      D(`  SKIPPED update! doingX=${doingX} cx===px:${cx===px} cy===py:${cy===py}`);
    }
  }

  D(`  after: x=[${xLo},${xHi}] y=[${yLo},${yHi}]`);

  if (xLo >= xHi) doingX = false;

  px = cx; py = cy;

  if (doingX) {
    const mid = Math.round((xLo + xHi) / 2);
    if (mid !== cx) cx = mid;
    else if (cx < xHi) cx = xHi;
    else cx = xLo;
  } else {
    cx = xLo;
    const mid = Math.round((yLo + yHi) / 2);
    if (mid !== cy) cy = mid;
    else if (cy < yHi) cy = yHi;
    else cy = yLo;
  }

  D(`  jump to (${cx},${cy}) doingX=${doingX}`);
  console.log(`${cx} ${cy}`);
}
