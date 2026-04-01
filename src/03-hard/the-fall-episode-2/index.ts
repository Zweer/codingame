// Room connections: for each room type, entry direction → exit direction
// Directions: 0=TOP, 1=RIGHT, 2=BOTTOM, 3=LEFT
// Entry means "coming FROM that side", e.g. TOP means entering from the top (falling down)
const ROOMS: Record<number, Record<number, number>> = {
  0: {},
  1: { 0: 2, 1: 2, 3: 2 },
  2: { 1: 3, 3: 1 },
  3: { 0: 2 },
  4: { 0: 3, 1: 2 },
  5: { 0: 1, 1: 2 },
  6: { 1: 3, 3: 1 },
  7: { 0: 2, 1: 2 },
  8: { 3: 2, 1: 2 },
  9: { 0: 2, 3: 2 },
  10: { 0: 3 },
  11: { 0: 1 },
  12: { 1: 2 },
  13: { 3: 2 },
};

// Rotation groups: which room types are rotations of each other
// Rotating CW: type → next type in group
const ROTATION_GROUP: Record<number, number[]> = {
  0: [0],
  1: [1],
  2: [2, 3],
  3: [3, 2],
  4: [4, 5],
  5: [5, 4],
  6: [6, 7, 8, 9],
  7: [7, 8, 9, 6],
  8: [8, 9, 6, 7],
  9: [9, 6, 7, 8],
  10: [10, 11, 12, 13],
  11: [11, 12, 13, 10],
  12: [12, 13, 10, 11],
  13: [13, 10, 11, 12],
};

const DX = [0, 1, 0, -1]; // TOP, RIGHT, BOTTOM, LEFT
const DY = [-1, 0, 1, 0];
const OPP = [2, 3, 0, 1]; // opposite direction

const [W, H] = readline().split(' ').map(Number);
const types: number[][] = [];
const locked: boolean[][] = [];

for (let y = 0; y < H; y++) {
  const row = readline().split(' ').map(Number);
  types.push(row.map(t => Math.abs(t)));
  locked.push(row.map(t => t < 0));
}

const EX = Number(readline());

// Get exit direction for a room type given entry direction
function getExit(type: number, entry: number): number {
  return ROOMS[type]?.[entry] ?? -1;
}

// Rotations needed to go from type a to type b (CW quarter turns), or -1 if impossible
function rotationsNeeded(from: number, to: number): number {
  const group = ROTATION_GROUP[from];
  if (!group) return -1;
  const idx = group.indexOf(to);
  return idx; // 0 = no rotation, 1 = 1 CW, etc.
}

// BFS to find path from Indy's position to exit, determining which rooms to rotate
// State: (x, y, entryDir) with a set of rotations applied
// We precompute the full plan at the start of each turn

interface PlanStep {
  x: number;
  y: number;
  targetType: number;
}

function findPlan(
  sx: number, sy: number, sEntry: number,
  rockSet: Set<string>,
): PlanStep[] | null {
  // DFS with backtracking: try all possible room type assignments along the path
  // The path is deterministic once room types are fixed (each room has at most 1 exit per entry)

  const rotated = new Map<string, number>(); // "x,y" → target type

  function getType(x: number, y: number): number {
    return rotated.get(`${x},${y}`) ?? types[y][x];
  }

  function dfs(x: number, y: number, entry: number): PlanStep[] | null {
    // Exit reached?
    if (y === H - 1 && x === EX) {
      // Check current room lets us through
      const t = getType(x, y);
      if (getExit(t, entry) !== -1 || entry === 0) {
        // Actually, we just need to reach this cell. The exit is at the bottom.
        // Check if current room type allows entry from this direction and exits BOTTOM
        const exit = getExit(t, entry);
        if (exit === 2) return []; // exits bottom = reaches exit below
        // Try rotating this room
        if (!locked[y][x]) {
          for (const candidate of ROTATION_GROUP[types[y][x]]) {
            if (getExit(candidate, entry) === 2) {
              rotated.set(`${x},${y}`, candidate);
              const result: PlanStep[] = [{ x, y, targetType: candidate }];
              return result;
            }
          }
        }
        // If no rotation works and current type doesn't exit bottom, check if just being here is enough
        // Actually for the exit cell, Indy just needs to reach it. Let me re-check...
        // The exit is at position (EX, H). Indy needs to exit the bottom of row H-1 at column EX.
        // So we need the room at (EX, H-1) to have exit = BOTTOM when entered from `entry`.
        return null;
      }
      return null;
    }

    const curType = getType(x, y);
    const group = ROTATION_GROUP[types[y][x]];

    // Try each possible rotation of this room
    const candidates = locked[y][x] ? [curType] : group;

    for (const candidate of candidates) {
      const exit = getExit(candidate, entry);
      if (exit === -1) continue;

      const nx = x + DX[exit];
      const ny = y + DY[exit];
      if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
      if (rockSet.has(`${nx},${ny}`)) continue;

      const nEntry = OPP[exit];
      const prevType = rotated.get(`${x},${y}`);
      rotated.set(`${x},${y}`, candidate);

      const sub = dfs(nx, ny, nEntry);
      if (sub !== null) {
        if (candidate !== types[y][x]) {
          sub.push({ x, y, targetType: candidate });
        }
        return sub;
      }

      // Undo
      if (prevType !== undefined) rotated.set(`${x},${y}`, prevType);
      else rotated.delete(`${x},${y}`);
    }

    return null;
  }

  return dfs(sx, sy, sEntry);
}

// Queue of rotations to execute
let rotationQueue: { x: number; y: number; dir: string }[] = [];

function computeRotations(plan: PlanStep[]): { x: number; y: number; dir: string }[] {
  const queue: { x: number; y: number; dir: string }[] = [];
  for (const step of plan) {
    const from = types[step.y][step.x];
    const rots = rotationsNeeded(from, step.targetType);
    if (rots <= 0) continue;
    // Determine direction: CW rotations
    // 1 CW = RIGHT, 2 CW = RIGHT RIGHT, 3 CW = LEFT (shorter)
    if (rots <= 2) {
      for (let i = 0; i < rots; i++) queue.push({ x: step.x, y: step.y, dir: 'RIGHT' });
    } else {
      // 3 CW = 1 CCW
      const ccw = 4 - rots;
      for (let i = 0; i < ccw; i++) queue.push({ x: step.x, y: step.y, dir: 'LEFT' });
    }
    types[step.y][step.x] = step.targetType; // Update grid
  }
  return queue;
}

const ENTRY_MAP: Record<string, number> = { TOP: 0, RIGHT: 1, LEFT: 3 };
let planned = false;

while (true) {
  const parts = readline().split(' ');
  const xi = Number(parts[0]);
  const yi = Number(parts[1]);
  const entry = ENTRY_MAP[parts[2]];

  const R = Number(readline());
  const rocks = new Set<string>();
  for (let i = 0; i < R; i++) {
    const rp = readline().split(' ');
    rocks.add(`${rp[0]},${rp[1]}`);
  }

  if (!planned || rotationQueue.length === 0) {
    const plan = findPlan(xi, yi, entry, rocks);
    console.error(`Turn: Indy=(${xi},${yi}) entry=${parts[2]} rocks=${R} plan=${plan ? plan.length + ' steps' : 'NULL'}`);
    if (plan) {
      for (const s of plan) console.error(`  rotate (${s.x},${s.y}) type ${types[s.y][s.x]} -> ${s.targetType}`);
      rotationQueue = computeRotations(plan);
      console.error(`  rotationQueue: ${rotationQueue.map(r => `(${r.x},${r.y}) ${r.dir}`).join(', ')}`);
    } else {
      rotationQueue = [];
    }
    planned = true;
  }

  if (rotationQueue.length > 0) {
    const r = rotationQueue.shift()!;
    console.error(`Action: ${r.x} ${r.y} ${r.dir}`);
    console.log(`${r.x} ${r.y} ${r.dir}`);
  } else {
    console.error('Action: WAIT');
    console.log('WAIT');
    planned = false; // Re-plan next turn
  }
}
