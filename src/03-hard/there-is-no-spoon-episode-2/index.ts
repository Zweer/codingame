const W = Number(readline());
const H = Number(readline());

interface Node {
  id: number;
  x: number;
  y: number;
  val: number;
  neighbors: number[]; // node ids
}

const grid: (number | -1)[][] = [];
const nodes: Node[] = [];
const nodeAt = new Map<string, number>();

for (let y = 0; y < H; y++) {
  const line = readline();
  grid[y] = [];
  for (let x = 0; x < W; x++) {
    if (line[x] !== '.') {
      const id = nodes.length;
      nodes.push({ id, x, y, val: Number(line[x]), neighbors: [] });
      nodeAt.set(`${x},${y}`, id);
      grid[y][x] = id;
    } else {
      grid[y][x] = -1;
    }
  }
}

// Find neighbors (right and down only, then link both ways)
const N = nodes.length;
// links[i][j] = current bridges between node i and node j (0, 1, or 2)
// Only store for pairs where j > i
type PairKey = number; // i * N + j
const maxLinks = new Uint8Array(N * N); // max possible bridges between pair
const links = new Uint8Array(N * N); // current bridges

const pk = (a: number, b: number): PairKey => Math.min(a, b) * N + Math.max(a, b);

for (const node of nodes) {
  // Right
  for (let x = node.x + 1; x < W; x++) {
    if (grid[node.y][x] !== -1) {
      const nb = grid[node.y][x];
      node.neighbors.push(nb);
      nodes[nb].neighbors.push(node.id);
      maxLinks[pk(node.id, nb)] = 2;
      break;
    }
  }
  // Down
  for (let y = node.y + 1; y < H; y++) {
    if (grid[y][node.x] !== -1) {
      const nb = grid[y][node.x];
      node.neighbors.push(nb);
      nodes[nb].neighbors.push(node.id);
      maxLinks[pk(node.id, nb)] = 2;
      break;
    }
  }
}

// Track current link count per node
const nodeLinkCount = new Int8Array(N);

// Track blocked cells (for crossing detection)
const blocked = new Uint8Array(W * H);

function isCrossing(a: number, b: number): boolean {
  const na = nodes[a], nb = nodes[b];
  if (na.x === nb.x) {
    const minY = Math.min(na.y, nb.y), maxY = Math.max(na.y, nb.y);
    for (let y = minY + 1; y < maxY; y++) if (blocked[y * W + na.x]) return true;
  } else {
    const minX = Math.min(na.x, nb.x), maxX = Math.max(na.x, nb.x);
    for (let x = minX + 1; x < maxX; x++) if (blocked[na.y * W + x]) return true;
  }
  return false;
}

function markBlocked(a: number, b: number, val: number): void {
  const na = nodes[a], nb = nodes[b];
  if (na.x === nb.x) {
    const minY = Math.min(na.y, nb.y), maxY = Math.max(na.y, nb.y);
    for (let y = minY + 1; y < maxY; y++) blocked[y * W + na.x] = val;
  } else {
    const minX = Math.min(na.x, nb.x), maxX = Math.max(na.x, nb.x);
    for (let x = minX + 1; x < maxX; x++) blocked[na.y * W + x] = val;
  }
}

// Result storage
const result: [number, number, number, number, number][] = [];

function addBridge(a: number, b: number, amt: number): boolean {
  const p = pk(a, b);
  if (links[p] + amt > maxLinks[p]) return false;
  if (nodeLinkCount[a] + amt > nodes[a].val) return false;
  if (nodeLinkCount[b] + amt > nodes[b].val) return false;
  if (links[p] === 0 && isCrossing(a, b)) return false;

  links[p] += amt;
  nodeLinkCount[a] += amt;
  nodeLinkCount[b] += amt;
  if (links[p] === amt) markBlocked(a, b, 1); // first bridge on this pair
  result.push([nodes[a].x, nodes[a].y, nodes[b].x, nodes[b].y, amt]);
  return true;
}

function removeBridge(a: number, b: number, amt: number): void {
  const p = pk(a, b);
  links[p] -= amt;
  nodeLinkCount[a] -= amt;
  nodeLinkCount[b] -= amt;
  if (links[p] === 0) markBlocked(a, b, 0);
  result.pop();
}

function remaining(id: number): number {
  return nodes[id].val - nodeLinkCount[id];
}

function available(a: number, b: number): number {
  const p = pk(a, b);
  return maxLinks[p] - links[p];
}

function isConnected(): boolean {
  const visited = new Uint8Array(N);
  const queue = [0];
  visited[0] = 1;
  let count = 1;
  for (let qi = 0; qi < queue.length; qi++) {
    const cur = queue[qi];
    for (const nb of nodes[cur].neighbors) {
      if (!visited[nb] && links[pk(cur, nb)] > 0) {
        visited[nb] = 1;
        queue.push(nb);
        count++;
      }
    }
  }
  return count === N;
}

// Constraint propagation: apply forced moves, return false if contradiction
function propagate(): [number, number, number][] | null {
  const placed: [number, number, number][] = []; // [a, b, amt] for undo
  let changed = true;

  while (changed) {
    changed = false;
    for (let i = 0; i < N; i++) {
      const rem = remaining(i);
      if (rem < 0) { undo(placed); return null; }
      if (rem === 0) continue;

      let totalAvail = 0;
      let activeCount = 0;
      let lastActive = -1;

      for (const nb of nodes[i].neighbors) {
        const a = available(i, nb);
        if (a > 0 && (links[pk(i, nb)] > 0 || !isCrossing(i, nb))) {
          totalAvail += a;
          activeCount++;
          lastActive = nb;
        }
      }

      if (totalAvail < rem) { undo(placed); return null; }

      // All available must be used
      if (totalAvail === rem) {
        for (const nb of nodes[i].neighbors) {
          const a = available(i, nb);
          if (a > 0 && (links[pk(i, nb)] > 0 || !isCrossing(i, nb))) {
            if (!addBridge(i, nb, a)) { undo(placed); return null; }
            placed.push([i, nb, a]);
            changed = true;
          }
        }
      }
      // Only one neighbor left
      else if (activeCount === 1 && lastActive >= 0) {
        const a = Math.min(available(i, lastActive), rem);
        if (a > 0) {
          if (!addBridge(i, lastActive, a)) { undo(placed); return null; }
          placed.push([i, lastActive, a]);
          changed = true;
        }
      }
    }
  }
  return placed;
}

function undo(placed: [number, number, number][]): void {
  for (let i = placed.length - 1; i >= 0; i--) {
    removeBridge(placed[i][0], placed[i][1], placed[i][2]);
  }
}

function solve(): boolean {
  const placed = propagate();
  if (!placed) return false;

  // Check if solved
  let allSatisfied = true;
  for (let i = 0; i < N; i++) {
    if (remaining(i) !== 0) { allSatisfied = false; break; }
  }

  if (allSatisfied) {
    if (isConnected()) return true;
    undo(placed);
    return false;
  }

  // Pick most constrained unsatisfied node
  let bestNode = -1;
  let minOpts = Infinity;
  for (let i = 0; i < N; i++) {
    if (remaining(i) <= 0) continue;
    let opts = 0;
    for (const nb of nodes[i].neighbors) {
      const a = available(i, nb);
      if (a > 0 && (links[pk(i, nb)] > 0 || !isCrossing(i, nb))) opts += a;
    }
    if (opts > 0 && opts < minOpts) {
      minOpts = opts;
      bestNode = i;
    }
  }

  if (bestNode === -1) { undo(placed); return false; }

  // Try each neighbor with 1 or 2 bridges
  for (const nb of nodes[bestNode].neighbors) {
    const a = available(bestNode, nb);
    if (a <= 0 || (links[pk(bestNode, nb)] === 0 && isCrossing(bestNode, nb))) continue;

    for (let amt = Math.min(a, remaining(bestNode)); amt >= 1; amt--) {
      if (addBridge(bestNode, nb, amt)) {
        if (solve()) return true;
        removeBridge(bestNode, nb, amt);
      }
    }
  }

  undo(placed);
  return false;
}

console.error(`Grid: ${W}x${H}, Nodes: ${N}`);
for (const n of nodes) {
  console.error(`  Node ${n.id} (${n.x},${n.y}) val=${n.val} neighbors=[${n.neighbors.join(',')}]`);
}
const ok = solve();
console.error(`Solved: ${ok}, bridges: ${result.length}`);
if (!ok) console.error('NO SOLUTION FOUND');
for (const [x1, y1, x2, y2, amt] of result) {
  console.error(`  bridge: (${x1},${y1})-(${x2},${y2}) x${amt}`);
  console.log(`${x1} ${y1} ${x2} ${y2} ${amt}`);
}
