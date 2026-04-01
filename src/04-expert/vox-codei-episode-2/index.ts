const [W, H] = readline().split(' ').map(Number);
const wall: boolean[][] = [];
let nodes: { x: number; y: number; dx: number; dy: number }[] = [];
let prevNodes: { x: number; y: number }[] = [];
let turn = 0;

// Pending bombs: [x, y, explodesAtTurn]
const bombs: [number, number, number][] = [];

function move(n: { x: number; y: number; dx: number; dy: number }): { x: number; y: number; dx: number; dy: number } {
  const r = { x: n.x, y: n.y, dx: n.dx, dy: n.dy };
  if (r.dx === 0 && r.dy === 0) return r;
  const nx = r.x + r.dx, ny = r.y + r.dy;
  if (nx < 0 || nx >= W || ny < 0 || ny >= H || wall[ny][nx]) {
    r.dx = -r.dx; r.dy = -r.dy;
    r.x += r.dx; r.y += r.dy;
  } else { r.x = nx; r.y = ny; }
  return r;
}

function sim(ns: typeof nodes, t: number): typeof nodes {
  let c = ns.map(n => ({ ...n }));
  for (let i = 0; i < t; i++) c = c.map(move);
  return c;
}

function blastCells(bx: number, by: number): string[] {
  const cells = [`${bx},${by}`];
  for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
    for (let r = 1; r <= 3; r++) {
      const cx = bx + dx * r, cy = by + dy * r;
      if (cx < 0 || cx >= W || cy < 0 || cy >= H || wall[cy][cx]) break;
      cells.push(`${cx},${cy}`);
    }
  }
  return cells;
}

while (true) {
  const [roundsLeft, bombsAvail] = readline().split(' ').map(Number);
  const grid: string[][] = [];
  const curAt: [number, number][] = [];

  for (let y = 0; y < H; y++) {
    const row = readline();
    grid.push(row.split(''));
    for (let x = 0; x < W; x++) {
      if (turn === 0 && row[x] === '#') { if (!wall[y]) wall[y] = Array(W).fill(false); wall[y][x] = true; }
      if (row[x] === '@') curAt.push([x, y]);
    }
  }
  if (turn === 0) for (let y = 0; y < H; y++) if (!wall[y]) wall[y] = Array(W).fill(false);

  // --- Tracking ---
  if (turn === 0) {
    nodes = curAt.map(([x, y]) => ({ x, y, dx: 0, dy: 0 }));
    prevNodes = curAt.map(([x, y]) => ({ x, y }));
  } else if (turn === 1) {
    // Deduce directions
    const curSet = new Map<string, number>();
    curAt.forEach(([x, y], i) => curSet.set(`${x},${y}`, i));
    const usedCur = new Set<number>();
    const newNodes: typeof nodes = [];

    for (const p of prevNodes) {
      let best = -1, bestD = 99;
      for (const [i, [cx, cy]] of curAt.entries()) {
        if (usedCur.has(i)) continue;
        const d = Math.abs(cx - p.x) + Math.abs(cy - p.y);
        if (d < bestD) { bestD = d; best = i; }
      }
      if (best >= 0 && bestD <= 1) {
        usedCur.add(best);
        newNodes.push({ x: curAt[best][0], y: curAt[best][1], dx: curAt[best][0] - p.x, dy: curAt[best][1] - p.y });
      }
    }
    for (let i = 0; i < curAt.length; i++) {
      if (!usedCur.has(i)) newNodes.push({ x: curAt[i][0], y: curAt[i][1], dx: 0, dy: 0 });
    }
    nodes = newNodes;
  } else {
    const unmatched = new Map<string, [number, number]>();
    curAt.forEach(([x, y]) => unmatched.set(`${x},${y}`, [x, y]));
    const newNodes: typeof nodes = [];
    for (const n of nodes) {
      const m = move(n);
      const k = `${m.x},${m.y}`;
      if (unmatched.has(k)) { newNodes.push(m); unmatched.delete(k); }
    }
    for (const [, [x, y]] of unmatched) newNodes.push({ x, y, dx: 0, dy: 0 });
    nodes = newNodes;
  }

  // Process bomb explosions
  for (const b of bombs) b[2]--;
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = bombs.length - 1; i >= 0; i--) {
      if (bombs[i][2] <= 0) {
        const cells = new Set(blastCells(bombs[i][0], bombs[i][1]));
        bombs.splice(i, 1);
        nodes = nodes.filter(n => !cells.has(`${n.x},${n.y}`));
        for (const b of bombs) if (cells.has(`${b[0]},${b[1]}`)) b[2] = 0;
        changed = true;
      }
    }
  }

  console.error(`T${turn} n=${nodes.length} b=${bombsAvail} r=${roundsLeft}`);
  for (const n of nodes) console.error(`  @(${n.x},${n.y}) d=(${n.dx},${n.dy})`);

  if (bombsAvail === 0 || nodes.length === 0 || turn === 0) {
    console.log('WAIT');
    prevNodes = curAt.map(([x, y]) => ({ x, y }));
    turn++;
    continue;
  }

  // --- Greedy: find best single bomb placement considering all future explosion times ---
  // For each wait time, simulate where nodes will be at explosion (wait+3),
  // and where they'll be at placement time (wait) to avoid placing on them.
  // Pick the (wait, cell) that hits the most nodes.

  const maxWait = Math.min(roundsLeft - 4, 55);
  let bestWait = -1, bestX = -1, bestY = -1, bestHits = 0;

  for (let w = 0; w <= maxWait; w++) {
    const atBoom = sim(nodes, w + 3);
    const atPlace = w === 0 ? null : sim(nodes, w);

    // Build set of node positions at explosion time
    // For each node, find which cells could hit it, track best
    const cellScore = new Map<string, number>();

    for (const n of atBoom) {
      for (const cell of blastCells(n.x, n.y)) {
        cellScore.set(cell, (cellScore.get(cell) || 0) + 1);
      }
    }

    const placeSet = atPlace ? new Set(atPlace.map(n => `${n.x},${n.y}`)) : null;

    for (const [cell, hits] of cellScore) {
      if (hits <= bestHits) continue; // skip if can't beat best
      const [x, y] = cell.split(',').map(Number);
      if (wall[y][x]) continue;
      if (w === 0 && grid[y][x] !== '.') continue;
      if (placeSet && placeSet.has(cell)) continue;
      // Also check bomb positions
      if (bombs.some(b => b[0] === x && b[1] === y)) continue;

      bestHits = hits;
      bestWait = w;
      bestX = x;
      bestY = y;
    }

    if (bestHits >= nodes.length) break; // can't do better
  }

  console.error(`  best: w=${bestWait} (${bestX},${bestY}) hits=${bestHits}`);

  if (bestWait === 0 && bestHits > 0) {
    bombs.push([bestX, bestY, 3]);
    console.log(`${bestX} ${bestY}`);
  } else {
    console.log('WAIT');
  }

  turn++;
}
