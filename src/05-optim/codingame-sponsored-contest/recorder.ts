// @ts-expect-error — CodinGame global
const rl = readline;

const DIR: Record<string, string> = { UP: 'C', RIGHT: 'A', DOWN: 'D', LEFT: 'E', STAY: 'B' };
const NEIGHBORS = [
  { dx: 0, dy: -1, dir: 'UP' },
  { dx: 1, dy: 0, dir: 'RIGHT' },
  { dx: 0, dy: 1, dir: 'DOWN' },
  { dx: -1, dy: 0, dir: 'LEFT' },
];

const width = Number.parseInt(rl(), 10);
const height = Number.parseInt(rl(), 10);
const players = Number.parseInt(rl(), 10);

const grid: string[][] = Array.from({ length: height }, () => Array(width).fill('?'));

interface Pos { x: number; y: number }

const wrap = (v: number, max: number): number => ((v % max) + max) % max;

function hasEnemy(enemies: Pos[], x: number, y: number): boolean {
  return enemies.some((e) => e.x === wrap(x, width) && e.y === wrap(y, height));
}

function isSafe(enemies: Pos[], x: number, y: number): boolean {
  return (
    !hasEnemy(enemies, x, y) &&
    !hasEnemy(enemies, x - 1, y) &&
    !hasEnemy(enemies, x + 1, y) &&
    !hasEnemy(enemies, x, y - 1) &&
    !hasEnemy(enemies, x, y + 1)
  );
}

function canMove(x: number, y: number): boolean {
  return grid[wrap(y, height)][wrap(x, width)] !== '#';
}

function bfsToUnknown(me: Pos, enemies: Pos[]): string | null {
  const visited = new Set<number>();
  const key = (x: number, y: number): number => y * width + x;
  const queue: Array<{ x: number; y: number; firstDir: string }> = [];
  visited.add(key(me.x, me.y));

  for (const { dx, dy, dir } of NEIGHBORS) {
    const nx = wrap(me.x + dx, width);
    const ny = wrap(me.y + dy, height);
    if (canMove(nx, ny) && isSafe(enemies, nx, ny)) {
      if (grid[ny][nx] === '?') return dir;
      visited.add(key(nx, ny));
      queue.push({ x: nx, y: ny, firstDir: dir });
    }
  }

  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) break;
    const { x, y, firstDir } = item;
    for (const { dx, dy } of NEIGHBORS) {
      const nx = wrap(x + dx, width);
      const ny = wrap(y + dy, height);
      const k = key(nx, ny);
      if (visited.has(k) || !canMove(nx, ny)) continue;
      visited.add(k);
      if (grid[ny][nx] === '?') return firstDir;
      queue.push({ x: nx, y: ny, firstDir });
    }
  }

  return null;
}

function fallbackMove(me: Pos, enemies: Pos[]): string {
  for (const { dx, dy, dir } of NEIGHBORS) {
    const nx = wrap(me.x + dx, width);
    const ny = wrap(me.y + dy, height);
    if (canMove(nx, ny) && isSafe(enemies, nx, ny)) return DIR[dir];
  }
  for (const { dx, dy, dir } of NEIGHBORS) {
    const nx = wrap(me.x + dx, width);
    const ny = wrap(me.y + dy, height);
    if (canMove(nx, ny) && !hasEnemy(enemies, nx, ny)) return DIR[dir];
  }
  return DIR.STAY;
}

// Recording data
const allEnemies: string[] = [];
let startPos = '';
let turn = 0;

console.error(`REC:SIZE:${width}:${height}:${players}`);

while (true) {
  const up = rl();
  const right = rl();
  const down = rl();
  const left = rl();

  const enemies: Pos[] = [];
  let me: Pos = { x: 0, y: 0 };

  for (let i = 0; i < players; i++) {
    const [px, py] = rl().split(' ').map(Number);
    const pos = { x: wrap(px - 1, width), y: wrap(py - 1, height) };
    if (i + 1 === players) {
      me = pos;
    } else {
      enemies.push(pos);
    }
  }

  grid[me.y][me.x] = '_';
  grid[wrap(me.y - 1, height)][me.x] = up;
  grid[wrap(me.y + 1, height)][me.x] = down;
  grid[me.y][wrap(me.x + 1, width)] = right;
  grid[me.y][wrap(me.x - 1, width)] = left;
  for (const e of enemies) grid[e.y][e.x] = '_';

  turn++;

  if (turn === 1) {
    startPos = `${me.x},${me.y}`;
    console.error(`REC:START:${startPos}`);
  }

  // Log enemy positions every turn
  const eStr = enemies.map(e => `${e.x},${e.y}`).join(';');
  console.error(`REC:E:${turn}:${eStr}`);

  // Log map every 50 turns and on last few turns
  if (turn % 50 === 0 || turn <= 2) {
    const mapStr = grid.map(row => row.join('')).join('|');
    console.error(`REC:MAP:${turn}:${mapStr}`);
  }

  const dir = bfsToUnknown(me, enemies);
  const action = dir ? DIR[dir] : fallbackMove(me, enemies);
  console.log(action);
}
