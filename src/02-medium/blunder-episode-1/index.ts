const [L, C] = readline().split(' ').map(Number);
const grid: string[][] = [];
const teleporters: [number, number][] = [];
let sr = 0, sc = 0;

for (let r = 0; r < L; r++) {
  const row = readline().split('');
  grid.push(row);
  for (let c = 0; c < row.length; c++) {
    if (row[c] === '@') { sr = r; sc = c; }
    else if (row[c] === 'T') teleporters.push([r, c]);
  }
}

const DIRS: Record<string, [number, number]> = { S: [1,0], E: [0,1], N: [-1,0], W: [0,-1] };
const NAMES: Record<string, string> = { S: 'SOUTH', E: 'EAST', N: 'NORTH', W: 'WEST' };
const PRIO = ['S','E','N','W'];
const INV_PRIO = ['W','N','E','S'];

let r = sr, c = sc, dir = 'S', breaker = false, inverted = false;
const path: string[] = [];
const visited = new Set<string>();

function gridKey(): string {
  let k = '';
  for (let i = 0; i < L; i++) for (let j = 0; j < grid[i].length; j++) if (grid[i][j] === ' ' ) k += `${i},${j};`;
  return k;
}

while (true) {
  const state = `${r},${c},${dir},${breaker},${inverted},${gridKey()}`;
  if (visited.has(state)) { console.log('LOOP'); process.exit(); }
  visited.add(state);

  const ch = grid[r][c];
  if (ch in DIRS) dir = ch;
  if (ch === 'B') breaker = !breaker;
  if (ch === 'I') inverted = !inverted;
  if (ch === 'T') {
    const other = teleporters.find(([tr, tc]) => tr !== r || tc !== c)!;
    [r, c] = other;
  }

  const prio = inverted ? INV_PRIO : PRIO;
  let [dr, dc] = DIRS[dir];
  let nr = r + dr, nc = c + dc;
  let cell = grid[nr][nc];

  if (cell === '#' || (cell === 'X' && !breaker)) {
    for (const d of prio) {
      [dr, dc] = DIRS[d];
      nr = r + dr; nc = c + dc;
      cell = grid[nr][nc];
      if (cell !== '#' && (cell !== 'X' || breaker)) { dir = d; break; }
    }
  }

  r = nr; c = nc;
  path.push(NAMES[dir]);
  if (grid[r][c] === 'X' && breaker) grid[r][c] = ' ';
  if (grid[r][c] === '$') { console.log(path.join('\n')); process.exit(); }
}
