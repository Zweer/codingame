declare function readline(): string;

const WINS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// board[0..8] = big cells, each is array of 9 small cells
// 0=empty, 1=me, 2=opp
const board: number[][] = Array.from({length:9}, () => Array(9).fill(0));
const bigBoard: number[] = Array(9).fill(0); // winner of each sub-board

function checkWin(cells: number[], p: number): boolean {
  for (const [a,b,c] of WINS) if (cells[a]===p && cells[b]===p && cells[c]===p) return true;
  return false;
}

function isFull(cells: number[]): boolean {
  return cells.every(c => c !== 0);
}

function getValidMoves(lastRow: number, lastCol: number): [number,number][] {
  // In ultimate: you must play in the sub-board indicated by opponent's last cell
  // If that sub-board is won or full, play anywhere
  const moves: [number,number][] = [];
  if (lastRow >= 0) {
    const targetBig = lastRow % 3 * 3 + lastCol % 3;
    if (bigBoard[targetBig] === 0 && !isFull(board[targetBig])) {
      for (let i = 0; i < 9; i++) {
        if (board[targetBig][i] === 0) {
          const r = Math.floor(targetBig/3)*3 + Math.floor(i/3);
          const c = (targetBig%3)*3 + i%3;
          moves.push([r, c]);
        }
      }
      return moves;
    }
  }
  for (let b = 0; b < 9; b++) {
    if (bigBoard[b] !== 0 || isFull(board[b])) continue;
    for (let i = 0; i < 9; i++) {
      if (board[b][i] === 0) {
        const r = Math.floor(b/3)*3 + Math.floor(i/3);
        const c = (b%3)*3 + i%3;
        moves.push([r, c]);
      }
    }
  }
  return moves;
}

function play(r: number, c: number, p: number): void {
  const big = Math.floor(r/3)*3 + Math.floor(c/3);
  const small = (r%3)*3 + c%3;
  board[big][small] = p;
  if (checkWin(board[big], p)) bigBoard[big] = p;
  else if (isFull(board[big])) bigBoard[big] = 3; // draw
}

function unplay(r: number, c: number): void {
  const big = Math.floor(r/3)*3 + Math.floor(c/3);
  const small = (r%3)*3 + c%3;
  board[big][small] = 0;
  bigBoard[big] = 0; // recalc would be needed for perfect undo but ok for MCTS rollback
}

// MCTS Node
interface MCNode {
  visits: number;
  wins: number;
  move: [number,number] | null;
  children: MCNode[];
  parent: MCNode | null;
  player: number; // who played to get here
}

function newNode(move: [number,number]|null, parent: MCNode|null, player: number): MCNode {
  return { visits:0, wins:0, move, children:[], parent, player };
}

function ucb1(node: MCNode, parentVisits: number): number {
  if (node.visits === 0) return Infinity;
  return node.wins / node.visits + 1.41 * Math.sqrt(Math.log(parentVisits) / node.visits);
}

function selectChild(node: MCNode): MCNode {
  let best = node.children[0];
  let bestVal = -Infinity;
  for (const c of node.children) {
    const v = ucb1(c, node.visits);
    if (v > bestVal) { bestVal = v; best = c; }
  }
  return best;
}

// Save/restore state for rollouts
function saveState(): { b: number[][], bb: number[] } {
  return { b: board.map(r => r.slice()), bb: bigBoard.slice() };
}
function restoreState(s: { b: number[][], bb: number[] }): void {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) board[i][j] = s.b[i][j];
    bigBoard[i] = s.bb[i];
  }
}

function gameOver(): number {
  if (checkWin(bigBoard, 1)) return 1;
  if (checkWin(bigBoard, 2)) return 2;
  if (bigBoard.every(b => b !== 0)) return 3; // draw
  return 0;
}

function rollout(lastR: number, lastC: number, nextPlayer: number): number {
  let p = nextPlayer;
  let lr = lastR, lc = lastC;
  const played: [number,number][] = [];
  let result = gameOver();
  while (result === 0) {
    const moves = getValidMoves(lr, lc);
    if (moves.length === 0) { result = 3; break; }
    const [r, c] = moves[Math.floor(Math.random() * moves.length)];
    play(r, c, p);
    played.push([r, c]);
    lr = r; lc = c;
    result = gameOver();
    p = 3 - p;
  }
  for (let i = played.length - 1; i >= 0; i--) unplay(played[i][0], played[i][1]);
  return result;
}

function mcts(validMoves: [number,number][], lastOppR: number, lastOppC: number, timeMs: number): [number,number] {
  const root = newNode(null, null, 2); // opp "played" to get to root
  const start = Date.now();

  // Expand root
  for (const m of validMoves) {
    root.children.push(newNode(m, root, 1));
  }

  while (Date.now() - start < timeMs) {
    const saved = saveState();

    // SELECT
    let node = root;
    let lr = lastOppR, lc = lastOppC;
    let curPlayer = 1;

    while (node.children.length > 0 && gameOver() === 0) {
      node = selectChild(node);
      play(node.move![0], node.move![1], node.player);
      lr = node.move![0]; lc = node.move![1];
      curPlayer = 3 - node.player;
    }

    // EXPAND
    if (node.visits > 0 && gameOver() === 0) {
      const moves = getValidMoves(lr, lc);
      for (const m of moves) {
        node.children.push(newNode(m, node, curPlayer));
      }
      if (node.children.length > 0) {
        node = node.children[Math.floor(Math.random() * node.children.length)];
        play(node.move![0], node.move![1], node.player);
        lr = node.move![0]; lc = node.move![1];
        curPlayer = 3 - node.player;
      }
    }

    // ROLLOUT
    const result = gameOver() || rollout(lr, lc, curPlayer);

    // BACKPROP
    let n: MCNode | null = node;
    while (n !== null) {
      n.visits++;
      if (result === 1) n.wins += (n.player === 1 ? 1 : 0);
      else if (result === 2) n.wins += (n.player === 2 ? 1 : 0);
      else n.wins += 0.5;
      n = n.parent;
    }

    restoreState(saved);
  }

  let bestChild = root.children[0];
  let bestVisits = 0;
  for (const c of root.children) {
    if (c.visits > bestVisits) { bestVisits = c.visits; bestChild = c; }
  }
  return bestChild.move!;
}

// Game loop
let firstTurn = true;
while (true) {
  const [oppR, oppC] = readline().split(' ').map(Number);
  const n = Number(readline());
  const valid: [number,number][] = [];
  for (let i = 0; i < n; i++) {
    const [r, c] = readline().split(' ').map(Number);
    valid.push([r, c]);
  }

  // Apply opponent move
  if (oppR >= 0) play(oppR, oppC, 2);

  const timeLimit = firstTurn ? 900 : 90;
  const [mr, mc] = mcts(valid, oppR, oppC, timeLimit);

  play(mr, mc, 1);
  console.log(`${mr} ${mc}`);
  firstTurn = false;
}
