declare function readline(): string;

const W = 9;
const H = 9;
const removed: boolean[][] = Array.from({ length: H }, () => Array(W).fill(false));
const DIRS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

let myX = Number(readline());
let myY = Number(readline());

function getAdj(x: number, y: number, ox: number, oy: number): [number, number][] {
  const r: [number, number][] = [];
  for (const [dx, dy] of DIRS) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
    if (removed[ny][nx]) continue;
    if (nx === ox && ny === oy) continue;
    r.push([nx, ny]);
  }
  return r;
}

function floodCount(x: number, y: number, ox: number, oy: number): number {
  const vis = new Set<number>();
  const q = [y * W + x];
  vis.add(y * W + x);
  while (q.length) {
    const p = q.pop()!;
    const py = (p / W) | 0, px = p % W;
    for (const [dx, dy] of DIRS) {
      const nx = px + dx, ny = py + dy;
      if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
      if (removed[ny][nx]) continue;
      if (nx === ox && ny === oy) continue;
      const k = ny * W + nx;
      if (!vis.has(k)) { vis.add(k); q.push(k); }
    }
  }
  return vis.size;
}

function evaluate(mx: number, my2: number, ox: number, oy: number): number {
  const mm = getAdj(mx, my2, ox, oy).length;
  const om = getAdj(ox, oy, mx, my2).length;
  if (mm === 0) return -10000;
  if (om === 0) return 10000;
  return (mm - om) * 10 + floodCount(mx, my2, ox, oy) - floodCount(ox, oy, mx, my2);
}

function minimax(
  mx: number, my2: number, ox: number, oy: number,
  depth: number, alpha: number, beta: number, isMe: boolean, dl: number
): number {
  if (Date.now() > dl) return evaluate(mx, my2, ox, oy);
  if (depth === 0) return evaluate(mx, my2, ox, oy);

  if (isMe) {
    const moves = getAdj(mx, my2, ox, oy);
    if (moves.length === 0) return -10000;
    let best = -Infinity;
    for (const [nx, ny] of moves) {
      // try removing tiles adjacent to opponent
      const rems = getAdj(nx, ny, ox, oy).length > 0
        ? getAdj(ox, oy, nx, ny).slice(0, 3)
        : [[nx, ny] as [number, number]]; // fallback
      for (const [rx, ry] of rems) {
        removed[ry][rx] = true;
        best = Math.max(best, minimax(nx, ny, ox, oy, depth - 1, alpha, beta, false, dl));
        removed[ry][rx] = false;
        alpha = Math.max(alpha, best);
        if (beta <= alpha) return best;
        if (Date.now() > dl) return best;
      }
    }
    return best;
  } else {
    const moves = getAdj(ox, oy, mx, my2);
    if (moves.length === 0) return 10000;
    let best = Infinity;
    for (const [nx, ny] of moves) {
      const rems = getAdj(mx, my2, nx, ny).slice(0, 3);
      for (const [rx, ry] of rems) {
        removed[ry][rx] = true;
        best = Math.min(best, minimax(mx, my2, nx, ny, depth - 1, alpha, beta, true, dl));
        removed[ry][rx] = false;
        beta = Math.min(beta, best);
        if (beta <= alpha) return best;
        if (Date.now() > dl) return best;
      }
    }
    return best;
  }
}

while (true) {
  const oppX = Number(readline());
  const oppY = Number(readline());
  const remX = Number(readline());
  const remY = Number(readline());

  if (remX >= 0) removed[remY][remX] = true;

  const moves = getAdj(myX, myY, oppX, oppY);
  let bestMX = moves[0][0], bestMY = moves[0][1];
  let bestRX = 0, bestRY = 0;

  const dl = Date.now() + 80;

  // Simple greedy for removal candidates per move
  let bestScore = -Infinity;
  for (let depth = 1; depth <= 5; depth++) {
    if (Date.now() > dl - 10) break;
    let dBest = -Infinity;
    let dmx = bestMX, dmy = bestMY, drx = bestRX, dry = bestRY;

    for (const [nx, ny] of moves) {
      const rems = getAdj(oppX, oppY, nx, ny);
      // also consider some tiles near opponent even if not adjacent
      const candidates = rems.length > 0 ? rems.slice(0, 5) : getAdj(nx, ny, oppX, oppY).slice(0, 3);
      for (const [rx, ry] of candidates) {
        removed[ry][rx] = true;
        const val = minimax(nx, ny, oppX, oppY, depth - 1, -Infinity, Infinity, false, dl);
        removed[ry][rx] = false;
        if (val > dBest) {
          dBest = val; dmx = nx; dmy = ny; drx = rx; dry = ry;
        }
        if (Date.now() > dl - 10) break;
      }
      if (Date.now() > dl - 10) break;
    }
    bestMX = dmx; bestMY = dmy; bestRX = drx; bestRY = dry;
    bestScore = dBest;
  }

  // Track state: mark our removal
  removed[bestRY][bestRX] = true;
  myX = bestMX;
  myY = bestMY;

  console.log(`${bestMX} ${bestMY} ${bestRX} ${bestRY}`);
}
