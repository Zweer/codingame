/**
 * Snake — Optimization puzzle
 *
 * === SCORING (from referee source) ===
 * penalty = (turn - lastCatch > 10) ? turn * (turn - lastCatch) : 0
 * combo: if (turn - lastComboTurn <= 2) combo++ else combo = 1
 * combo bonus: combo > 1 ? 15000 * combo : 0
 * SCORE += 10000 + combo_bonus - penalty
 *
 * === STRATEGY (v5 — TSP + combo-aware) ===
 * First turn: compute visit order via nearest-neighbor TSP on BFS distances.
 * Then greedily improve with 2-opt swaps.
 * Each turn: BFS toward next rabbit in the planned order.
 * Safety check: don't step into a dead end (flood-fill).
 * Re-plan if current target is unreachable.
 */

declare function readline(): string;

const W = 96;
const H = 54;
const N = W * H;
const DX = [1, -1, 0, 0];
const DY = [0, 0, 1, -1];

function bfsDist(sx: number, sy: number, blocked: Uint8Array): Int16Array {
  const dist = new Int16Array(N).fill(-1);
  const sk = sy * W + sx;
  dist[sk] = 0;
  const q = new Int32Array(N);
  q[0] = sk;
  let head = 0;
  let tail = 1;
  while (head < tail) {
    const cur = q[head++];
    const cx = cur % W;
    const cy = (cur - cx) / W;
    const nd = dist[cur] + 1;
    for (let d = 0; d < 4; d++) {
      const nx = cx + DX[d];
      const ny = cy + DY[d];
      if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
      const nk = ny * W + nx;
      if (blocked[nk] || dist[nk] >= 0) continue;
      dist[nk] = nd;
      q[tail++] = nk;
    }
  }
  return dist;
}

function floodSize(sx: number, sy: number, blocked: Uint8Array): number {
  const sk = sy * W + sx;
  if (blocked[sk]) return 0;
  const visited = new Uint8Array(N);
  visited[sk] = 1;
  const q = new Int32Array(N);
  q[0] = sk;
  let head = 0;
  let tail = 1;
  while (head < tail) {
    const cur = q[head++];
    const cx = cur % W;
    const cy = (cur - cx) / W;
    for (let d = 0; d < 4; d++) {
      const nx = cx + DX[d];
      const ny = cy + DY[d];
      if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
      const nk = ny * W + nx;
      if (blocked[nk] || visited[nk]) continue;
      visited[nk] = 1;
      q[tail++] = nk;
    }
  }
  return tail;
}

function traceStep(target: number, dist: Int16Array): number {
  let cur = target;
  while (true) {
    const cx = cur % W;
    const cy = (cur - cx) / W;
    let prev = -1;
    for (let d = 0; d < 4; d++) {
      const px = cx + DX[d];
      const py = cy + DY[d];
      if (px < 0 || px >= W || py < 0 || py >= H) continue;
      const pk = py * W + px;
      if (dist[pk] === dist[cur] - 1) { prev = pk; break; }
    }
    if (prev < 0 || dist[prev] === 0) return cur;
    cur = prev;
  }
}

// --- Init ---
const numRabbits = Number(readline());
const rx = new Int32Array(numRabbits);
const ry = new Int32Array(numRabbits);
for (let i = 0; i < numRabbits; i++) {
  const [x, y] = readline().split(' ').map(Number);
  rx[i] = x;
  ry[i] = y;
}

const alive = new Uint8Array(numRabbits).fill(1);
const blocked = new Uint8Array(N);

// Skip rabbits on initial snake position (10,10 to 14,10)
for (let i = 0; i < numRabbits; i++) {
  if (ry[i] === 10 && rx[i] >= 10 && rx[i] <= 14) alive[i] = 0;
}

/**
 * Compute BFS distance between two points (no obstacles for TSP planning).
 * Manhattan is a good enough approximation for initial ordering.
 */
function manhattan(i: number, j: number): number {
  return Math.abs(rx[i] - rx[j]) + Math.abs(ry[i] - ry[j]);
}

function manhattanPt(px: number, py: number, j: number): number {
  return Math.abs(px - rx[j]) + Math.abs(py - ry[j]);
}

/**
 * Nearest-neighbor TSP from snake start position.
 * Returns ordered list of rabbit indices to visit.
 */
function computeVisitOrder(): number[] {
  const remaining = new Set<number>();
  for (let i = 0; i < numRabbits; i++) {
    if (alive[i]) remaining.add(i);
  }

  const order: number[] = [];
  let cx = 10;
  let cy = 10; // snake starts at 10,10

  while (remaining.size > 0) {
    let bestIdx = -1;
    let bestDist = Infinity;
    for (const i of remaining) {
      const d = Math.abs(cx - rx[i]) + Math.abs(cy - ry[i]);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    }
    order.push(bestIdx);
    cx = rx[bestIdx];
    cy = ry[bestIdx];
    remaining.delete(bestIdx);
  }

  // 2-opt improvement
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 0; i < order.length - 2; i++) {
      for (let j = i + 2; j < order.length; j++) {
        const a = i === 0 ? manhattanPt(10, 10, order[0]) : manhattan(order[i - 1], order[i]);
        const b = manhattan(order[j], j + 1 < order.length ? order[j + 1] : order[j]);
        const c = i === 0 ? manhattanPt(10, 10, order[j]) : manhattan(order[i - 1], order[j]);
        const d = manhattan(order[i], j + 1 < order.length ? order[j + 1] : order[i]);
        if (c + d < a + b) {
          // Reverse segment [i..j]
          let lo = i;
          let hi = j;
          while (lo < hi) {
            const tmp = order[lo];
            order[lo] = order[hi];
            order[hi] = tmp;
            lo++;
            hi--;
          }
          improved = true;
        }
      }
    }
  }

  return order;
}

let visitOrder = computeVisitOrder();
let orderIdx = 0;

while (true) {
  const ns = Number(readline());
  const snakeX = new Int32Array(ns);
  const snakeY = new Int32Array(ns);
  for (let i = 0; i < ns; i++) {
    const [x, y] = readline().split(' ').map(Number);
    snakeX[i] = x;
    snakeY[i] = y;
  }

  const hx = snakeX[0];
  const hy = snakeY[0];

  // Mark caught rabbits
  for (let i = 0; i < numRabbits; i++) {
    if (alive[i] && rx[i] === hx && ry[i] === hy) alive[i] = 0;
  }

  // Advance order index past caught rabbits
  while (orderIdx < visitOrder.length && !alive[visitOrder[orderIdx]]) orderIdx++;

  blocked.fill(0);
  for (let i = 1; i < ns - 1; i++) blocked[snakeY[i] * W + snakeX[i]] = 1;

  const dist = bfsDist(hx, hy, blocked);

  // Try to reach current target in visit order
  let nextKey = -1;

  // Try planned targets in order, skip unreachable ones
  for (let oi = orderIdx; oi < visitOrder.length && oi < orderIdx + 5; oi++) {
    const ri = visitOrder[oi];
    if (!alive[ri]) continue;
    const rk = ry[ri] * W + rx[ri];
    if (dist[rk] <= 0) continue;

    const step = traceStep(rk, dist);
    const sx = step % W;
    const sy = (step - sx) / W;

    // Safety check
    blocked[hy * W + hx] = 1;
    const area = floodSize(sx, sy, blocked);
    blocked[hy * W + hx] = 0;

    if (area > ns) {
      nextKey = step;
      // If we skipped ahead, update orderIdx
      if (oi > orderIdx) orderIdx = oi;
      break;
    }
  }

  // Fallback: nearest reachable rabbit
  if (nextKey < 0) {
    let bestDist = 999999;
    let bestKey = -1;
    for (let i = 0; i < numRabbits; i++) {
      if (!alive[i]) continue;
      const d = dist[ry[i] * W + rx[i]];
      if (d > 0 && d < bestDist) {
        const step = traceStep(ry[i] * W + rx[i], dist);
        const sx = step % W;
        const sy = (step - sx) / W;
        blocked[hy * W + hx] = 1;
        const area = floodSize(sx, sy, blocked);
        blocked[hy * W + hx] = 0;
        if (area > ns) { bestDist = d; bestKey = step; }
      }
    }
    nextKey = bestKey;
  }

  // Emergency: safest direction
  if (nextKey < 0) {
    let bestArea = -1;
    blocked[hy * W + hx] = 1;
    for (let d = 0; d < 4; d++) {
      const nx = hx + DX[d];
      const ny = hy + DY[d];
      if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
      if (blocked[ny * W + nx]) continue;
      const area = floodSize(nx, ny, blocked);
      if (area > bestArea) { bestArea = area; nextKey = ny * W + nx; }
    }
    blocked[hy * W + hx] = 0;
  }

  if (nextKey < 0) {
    for (let d = 0; d < 4; d++) {
      const nx = hx + DX[d];
      const ny = hy + DY[d];
      if (nx >= 0 && nx < W && ny >= 0 && ny < H) { nextKey = ny * W + nx; break; }
    }
  }

  const nx = nextKey % W;
  const ny = (nextKey - nx) / W;
  console.log(`${nx} ${ny}`);
}
