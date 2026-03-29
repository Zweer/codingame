const [W, H] = readline().split(' ').map(Number);
const N = Number(readline());
let [cx, cy] = readline().split(' ').map(Number);

let xLo = 0, xHi = W - 1, yLo = 0, yHi = H - 1;
let px = cx, py = cy;
let doingX = true;

function update(lo: number, hi: number, prev: number, cur: number, hint: string): [number, number] {
  const mid = (prev + cur) / 2;
  if (hint === 'SAME') return [Math.round(mid), Math.round(mid)];
  const closer = hint === 'WARMER' ? cur : prev;
  if (closer > prev + (cur - prev) / 2) {
    // bomb is on the side of the larger coordinate
    return [Math.max(lo, Math.floor(mid) + 1), hi];
  } else {
    return [lo, Math.min(hi, Math.ceil(mid) - 1)];
  }
}

while (true) {
  const hint = readline().trim();

  if (hint !== 'UNKNOWN') {
    if (doingX && cy === py) {
      // Moved only on X
      const mid = (px + cx) / 2;
      if (hint === 'SAME') { xLo = xHi = Math.round(mid); }
      else if ((hint === 'WARMER' && cx > px) || (hint === 'COLDER' && cx < px)) {
        xLo = Math.max(xLo, Math.floor(mid) + 1);
      } else {
        xHi = Math.min(xHi, Math.ceil(mid) - 1);
      }
    } else if (!doingX && cx === px) {
      // Moved only on Y
      const mid = (py + cy) / 2;
      if (hint === 'SAME') { yLo = yHi = Math.round(mid); }
      else if ((hint === 'WARMER' && cy > py) || (hint === 'COLDER' && cy < py)) {
        yLo = Math.max(yLo, Math.floor(mid) + 1);
      } else {
        yHi = Math.min(yHi, Math.ceil(mid) - 1);
      }
    }
  }

  if (xLo >= xHi) doingX = false;

  px = cx; py = cy;

  if (doingX) {
    const mid = Math.round((xLo + xHi) / 2);
    if (mid !== cx) cx = mid;
    else if (cx < xHi) cx = xHi;
    else cx = xLo;
    // Keep y constant for pure X measurement
  } else {
    cx = xLo; // Lock X
    const mid = Math.round((yLo + yHi) / 2);
    if (mid !== cy) cy = mid;
    else if (cy < yHi) cy = yHi;
    else cy = yLo;
  }

  console.log(`${cx} ${cy}`);
}
