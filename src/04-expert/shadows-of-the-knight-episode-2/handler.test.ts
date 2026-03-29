import { describe, expect, it } from 'vitest';

import { type State, initState, step } from './handler.js';

function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function simulate(
  W: number, H: number, x0: number, y0: number,
  bombX: number, bombY: number, maxTurns: number,
  verbose = false,
): { found: boolean; turns: number } {
  const s = initState(W, H, x0, y0);
  let prevDist = Infinity;

  for (let t = 0; t < maxTurns; t++) {
    const curDist = dist(s.cx, s.cy, bombX, bombY);
    let hint: string;
    if (t === 0) hint = 'UNKNOWN';
    else if (curDist < prevDist) hint = 'WARMER';
    else if (curDist > prevDist) hint = 'COLDER';
    else hint = 'SAME';

    if (verbose) {
      console.log(
        `T${t + 1} hint=${hint} pos=(${s.cx},${s.cy}) x=[${s.xLo},${s.xHi}] y=[${s.yLo},${s.yHi}] doX=${s.doingX}`,
      );
    }

    prevDist = curDist;
    const [nx, ny] = step(s, hint);

    if (verbose) console.log(`  -> (${nx},${ny})`);

    if (nx === bombX && ny === bombY) return { found: true, turns: t + 1 };
    if (nx < 0 || nx >= W || ny < 0 || ny >= H) return { found: false, turns: t + 1 };
  }
  return { found: false, turns: maxTurns };
}

describe('shadows-of-the-knight-episode-2', () => {
  // --- PASSING on CodinGame ---
  it('A lot of jumps: 5x16, start (1,5), N=80', () => {
    // Bomb deduced from debug: (4,10) — found at T9
    expect(simulate(5, 16, 1, 5, 4, 10, 80).found).toBe(true);
  });

  it('Less jumps: 18x32, start (17,31), N=45', () => {
    // Bomb: (2,1)
    expect(simulate(18, 32, 17, 31, 2, 1, 45).found).toBe(true);
  });

  it('Tower: 1x100, start (0,98), N=12', () => {
    // Bomb: (0,0)
    expect(simulate(1, 100, 0, 98, 0, 0, 12).found).toBe(true);
  });

  it('Lesser jumps: 15x15, start (3,6), N=12', () => {
    // Bomb: (0,0)
    expect(simulate(15, 15, 3, 6, 0, 0, 12).found).toBe(true);
  });

  it('Exact nb of jumps: 24x24, start (22,13), N=15', () => {
    // Bomb: (23,23)
    expect(simulate(24, 24, 22, 13, 23, 23, 15).found).toBe(true);
  });

  // --- FAILING on CodinGame ---
  it('More windows: 50x50, start (17,29), N=16', () => {
    // Bomb: (48,0) — deduced: X=48 found, Y search ran out of turns
    // From debug: X converged to 48, then Y was searching toward 0
    // Last jump was (48,1), still WARMER → bomb at y=0
    expect(simulate(50, 50, 17, 29, 48, 0, 16).found).toBe(true);
  });

  it('A lot of windows: 1000x1000, start (501,501), N=27', () => {
    // Bomb: (998, ~680?) — X converged to 998, Y was still searching
    // From debug: last Y range was [0,44], heading toward small Y
    // Actually bomb Y seems small. Let's try (998, 10)
    // X took 14 turns! Way too many for binary search on 1000.
    // Binary search on 1000 should take ~10 turns (log2(1000)≈10)
    expect(simulate(1000, 1000, 501, 501, 998, 10, 27).found).toBe(true);
  });

  it('So many windows: 8000x8000, start (3200,2100), N=31', () => {
    const positions = [[0, 10], [7999, 7999], [4000, 4000], [100, 7000], [0, 0]];
    for (const [bx, by] of positions) {
      const r = simulate(8000, 8000, 3200, 2100, bx, by, 31);
      if (!r.found) {
        // Run again verbose to see X/Y split
        simulate(8000, 8000, 3200, 2100, bx, by, 35, true);
        console.log(`Failed for bomb (${bx},${by}): ${r.turns} turns`);
      } else {
        console.log(`OK bomb (${bx},${by}): ${r.turns} turns`);
      }
      expect(r.found).toBe(true);
      expect(r.found).toBe(true);
    }
  });

  it('binary search on X should take <=14 turns for W=1000', () => {
    const r = simulate(1000, 1, 500, 0, 999, 0, 14);
    expect(r.found).toBe(true);
  });

  it('total turns should be ~log2(W) + log2(H)', () => {
    // 1000x1000: should take ~20 turns total (10+10)
    const r = simulate(1000, 1000, 500, 500, 999, 1, 25);
    expect(r.found).toBe(true);
  });
});
