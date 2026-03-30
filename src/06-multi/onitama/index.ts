declare function readline(): string;

const playerId = Number(readline());

while (true) {
  const board: string[] = [];
  for (let y = 0; y < 5; y++) board.push(readline());

  const cardData: string[] = [];
  for (let i = 0; i < 5; i++) cardData.push(readline());

  const actionCount = Number(readline());
  const actions: string[] = [];
  for (let i = 0; i < actionCount; i++) actions.push(readline());

  // Parse board into numeric: +2=my master, +1=my student, -2=opp master, -1=opp student
  const myM = playerId === 0 ? 'W' : 'B';
  const myS = playerId === 0 ? 'w' : 'b';
  const opM = playerId === 0 ? 'B' : 'W';
  const opS = playerId === 0 ? 'b' : 'w';

  function scoreBoard(b: string[]): number {
    let s = 0;
    const myShrineY = playerId === 0 ? 4 : 0;
    const opShrineY = playerId === 0 ? 0 : 4;
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        const c = b[y][x];
        if (c === myS) s += 10;
        else if (c === myM) {
          s += 50;
          // bonus for being close to opponent shrine
          s += (4 - Math.abs(y - opShrineY)) * 3;
          s += (4 - Math.abs(x - 2)) * 2;
        } else if (c === opS) s -= 10;
        else if (c === opM) {
          s -= 50;
          s -= (4 - Math.abs(y - myShrineY)) * 3;
          s -= (4 - Math.abs(x - 2)) * 2;
        }
      }
    }
    return s;
  }

  function applyAction(b: string[], action: string): string[] | null {
    const parts = action.split(' ');
    const move = parts[1];
    if (move === 'PASS') return b.slice();
    // move is like A2B3
    const fx = move.charCodeAt(0) - 65;
    const fy = Number(move[1]);
    const tx = move.charCodeAt(2) - 65;
    const ty = Number(move[3]);
    const nb = b.map(r => r.split(''));
    const piece = nb[fy][fx];
    const target = nb[ty][tx];
    // check for win: captured opponent master or reached shrine
    nb[ty][tx] = piece;
    nb[fy][fx] = '.';
    return nb.map(r => r.join(''));
  }

  function checkWin(b: string[]): number {
    // check if opponent master is gone
    let hasOpM = false, hasMyM = false;
    const opShrineY = playerId === 0 ? 0 : 4;
    const myShrineY = playerId === 0 ? 4 : 0;
    for (let y = 0; y < 5; y++)
      for (let x = 0; x < 5; x++) {
        if (b[y][x] === opM) hasOpM = true;
        if (b[y][x] === myM) hasMyM = true;
      }
    if (!hasOpM) return 1; // I win
    if (!hasMyM) return -1; // I lose
    // master on shrine
    if (b[opShrineY][2] === myM) return 1;
    if (b[myShrineY][2] === opM) return -1;
    return 0;
  }

  let bestAction = actions[0];
  let bestScore = -Infinity;

  for (const action of actions) {
    const nb = applyAction(board, action);
    if (!nb) continue;
    const w = checkWin(nb);
    let score: number;
    if (w === 1) score = 10000;
    else if (w === -1) score = -10000;
    else score = scoreBoard(nb);
    if (score > bestScore) {
      bestScore = score;
      bestAction = action;
    }
  }

  console.log(bestAction);
}
