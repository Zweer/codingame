declare function readline(): string;

const ROWS = 7, COLS = 9;
let myId = '', oppId = '';

// Init
const initLine = readline().split(' ');
myId = initLine[0];
oppId = initLine[1];

function drop(b: string[][], col: number, p: string): boolean {
  for (let r = ROWS - 1; r >= 0; r--)
    if (b[r][col] === '.') { b[r][col] = p; return true; }
  return false;
}

function undrop(b: string[][], col: number): void {
  for (let r = 0; r < ROWS; r++)
    if (b[r][col] !== '.') { b[r][col] = '.'; return; }
}

function wins(b: string[][], p: string): boolean {
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      if (b[r][c] !== p) continue;
      // right
      if (c + 3 < COLS && b[r][c+1] === p && b[r][c+2] === p && b[r][c+3] === p) return true;
      // down
      if (r + 3 < ROWS && b[r+1][c] === p && b[r+2][c] === p && b[r+3][c] === p) return true;
      // down-right
      if (r + 3 < ROWS && c + 3 < COLS && b[r+1][c+1] === p && b[r+2][c+2] === p && b[r+3][c+3] === p) return true;
      // down-left
      if (r + 3 < ROWS && c - 3 >= 0 && b[r+1][c-1] === p && b[r+2][c-2] === p && b[r+3][c-3] === p) return true;
    }
  return false;
}

function validCols(b: string[][]): number[] {
  const cols: number[] = [];
  for (const c of [4, 3, 5, 2, 6, 1, 7, 0, 8])
    if (b[0][c] === '.') cols.push(c);
  return cols;
}

function scoreWindow(cells: string[]): number {
  const me = cells.filter(c => c === myId).length;
  const op = cells.filter(c => c === oppId).length;
  const em = cells.filter(c => c === '.').length;
  if (me === 4) return 10000;
  if (op === 4) return -10000;
  if (me === 3 && em === 1) return 50;
  if (me === 2 && em === 2) return 5;
  if (op === 3 && em === 1) return -80;
  return 0;
}

function evaluate(b: string[][]): number {
  let s = 0;
  // Center preference
  for (let r = 0; r < ROWS; r++) if (b[r][4] === myId) s += 6;
  // All windows of 4
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c <= COLS - 4; c++)
      s += scoreWindow([b[r][c], b[r][c+1], b[r][c+2], b[r][c+3]]);
  for (let r = 0; r <= ROWS - 4; r++)
    for (let c = 0; c < COLS; c++)
      s += scoreWindow([b[r][c], b[r+1][c], b[r+2][c], b[r+3][c]]);
  for (let r = 0; r <= ROWS - 4; r++)
    for (let c = 0; c <= COLS - 4; c++)
      s += scoreWindow([b[r][c], b[r+1][c+1], b[r+2][c+2], b[r+3][c+3]]);
  for (let r = 0; r <= ROWS - 4; r++)
    for (let c = 3; c < COLS; c++)
      s += scoreWindow([b[r][c], b[r+1][c-1], b[r+2][c-2], b[r+3][c-3]]);
  return s;
}

let timeLimit = 0;
let startTime = 0;
function outOfTime(): boolean { return Date.now() - startTime > timeLimit; }

function minimax(b: string[][], depth: number, alpha: number, beta: number, isMe: boolean): number {
  if (outOfTime()) return 0;
  if (wins(b, myId)) return 100000 + depth;
  if (wins(b, oppId)) return -100000 - depth;
  const cols = validCols(b);
  if (cols.length === 0) return 0;
  if (depth === 0) return evaluate(b);

  if (isMe) {
    let v = -Infinity;
    for (const c of cols) {
      drop(b, c, myId);
      v = Math.max(v, minimax(b, depth - 1, alpha, beta, false));
      undrop(b, c);
      alpha = Math.max(alpha, v);
      if (alpha >= beta) break;
      if (outOfTime()) break;
    }
    return v;
  } else {
    let v = Infinity;
    for (const c of cols) {
      drop(b, c, oppId);
      v = Math.min(v, minimax(b, depth - 1, alpha, beta, true));
      undrop(b, c);
      beta = Math.min(beta, v);
      if (alpha >= beta) break;
      if (outOfTime()) break;
    }
    return v;
  }
}

function bestMove(b: string[][]): number {
  const cols = validCols(b);
  if (cols.length === 0) return 4;

  // Immediate win?
  for (const c of cols) {
    drop(b, c, myId);
    const w = wins(b, myId);
    undrop(b, c);
    if (w) return c;
  }
  // Immediate block?
  for (const c of cols) {
    drop(b, c, oppId);
    const w = wins(b, oppId);
    undrop(b, c);
    if (w) return c;
  }

  // Iterative deepening minimax
  let best = cols[0];
  for (let depth = 2; depth <= 30; depth++) {
    if (outOfTime()) break;
    let bestScore = -Infinity;
    let bestThis = cols[0];
    for (const c of cols) {
      drop(b, c, myId);
      const score = minimax(b, depth - 1, -Infinity, Infinity, false);
      undrop(b, c);
      if (score > bestScore) { bestScore = score; bestThis = c; }
      if (outOfTime()) break;
    }
    if (!outOfTime()) {
      best = bestThis;
      if (bestScore >= 100000) break;
    }
  }
  return best;
}

// Game loop
while (true) {
  const turnIdx = +readline();
  const board: string[][] = [];
  for (let r = 0; r < ROWS; r++) board.push(readline().split(''));
  const numValid = +readline();
  const validActions: number[] = [];
  for (let i = 0; i < numValid; i++) validActions.push(+readline());
  const oppPrev = +readline();

  // STEAL if opponent played center
  if (turnIdx === 1 && validActions.includes(-2) && (oppPrev === 4 || oppPrev === 3 || oppPrev === 5)) {
    console.log('STEAL');
    continue;
  }

  startTime = Date.now();
  timeLimit = turnIdx <= 1 ? 800 : 80;
  console.log(bestMove(board));
}
