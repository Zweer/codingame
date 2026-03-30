declare function readline(): string;

function sow(houses: number[], oppHouses: number[], move: number): [number[], number[], number] {
  const h = houses.slice();
  const o = oppHouses.slice();
  let seeds = h[move];
  h[move] = 0;
  let pos = move;
  while (seeds > 0) {
    pos = (pos + 1) % 12;
    if (pos === move) continue;
    if (pos < 6) h[pos]++;
    else o[pos - 6]++;
    seeds--;
  }
  let captured = 0;
  if (pos >= 6) {
    let i = pos - 6;
    while (i >= 0 && (o[i] === 2 || o[i] === 3)) {
      captured += o[i];
      o[i] = 0;
      i--;
    }
    if (o.every(v => v === 0)) return [h, oppHouses.slice(), 0];
  }
  return [h, o, captured];
}

function getMoves(houses: number[], oppHouses: number[]): number[] {
  const oppEmpty = oppHouses.every(v => v === 0);
  const moves: number[] = [];
  for (let i = 0; i < 6; i++) {
    if (houses[i] === 0) continue;
    if (oppEmpty) {
      const [, o] = sow(houses, oppHouses, i);
      if (o.some(v => v > 0)) moves.push(i);
    } else {
      moves.push(i);
    }
  }
  return moves;
}

function minimax(
  curH: number[], othH: number[], curScore: number, othScore: number,
  depth: number, alpha: number, beta: number, maximizing: boolean
): number {
  if (maximizing && curScore >= 25) return 10000;
  if (!maximizing && curScore >= 25) return -10000;
  if (maximizing && othScore >= 25) return -10000;
  if (!maximizing && othScore >= 25) return 10000;

  const moves = getMoves(curH, othH);
  if (moves.length === 0 || depth === 0) {
    return maximizing
      ? (curScore - othScore) * 100 + curH.reduce((a, b) => a + b, 0) - othH.reduce((a, b) => a + b, 0)
      : (othScore - curScore) * 100 + othH.reduce((a, b) => a + b, 0) - curH.reduce((a, b) => a + b, 0);
  }

  if (maximizing) {
    let best = -Infinity;
    for (const m of moves) {
      const [h, o, cap] = sow(curH, othH, m);
      best = Math.max(best, minimax(o, h, othScore, curScore + cap, depth - 1, alpha, beta, false));
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const m of moves) {
      const [h, o, cap] = sow(curH, othH, m);
      best = Math.min(best, minimax(o, h, othScore, curScore + cap, depth - 1, alpha, beta, true));
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

while (true) {
  const board = readline().split(' ').map(Number);
  const my = board.slice(0, 6);
  const opp = board.slice(6, 12);

  const moves = getMoves(my, opp);
  let bestMove = moves[0];
  const start = Date.now();

  for (let depth = 1; depth <= 20; depth++) {
    if (Date.now() - start > 40) break;
    let best = -Infinity;
    let candidate = moves[0];
    for (const m of moves) {
      const [h, o, cap] = sow(my, opp, m);
      const val = minimax(o, h, 0, cap, depth - 1, -Infinity, Infinity, false);
      if (val > best) { best = val; candidate = m; }
      if (Date.now() - start > 40) break;
    }
    bestMove = candidate;
  }

  console.log(bestMove);
}
