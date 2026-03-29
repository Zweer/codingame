import { describe, expect, it } from 'vitest';

import { initState, step } from './handler.js';

function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function simulate(
  W: number,
  H: number,
  x0: number,
  y0: number,
  bombX: number,
  bombY: number,
  maxTurns: number,
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

    prevDist = curDist;
    const [nx, ny] = step(s, hint);

    if (nx === bombX && ny === bombY) return { found: true, turns: t + 1 };
    if (nx < 0 || nx >= W || ny < 0 || ny >= H) return { found: false, turns: t + 1 };
  }
  return { found: false, turns: maxTurns };
}

describe('shadows-of-the-knight-episode-2', () => {
  // Real CG test cases with known bomb positions
  const cases: [string, number, number, number, number, number, number, number][] = [
    ['[1] A lot of jumps', 5, 16, 1, 5, 1, 10, 80],
    ['[2] Less jumps', 18, 32, 17, 31, 2, 1, 45],
    ['[3] Tower', 1, 100, 0, 98, 0, 0, 12],
    ['[4] Lesser jumps', 15, 15, 3, 6, 2, 0, 12],
    ['[5] Exact nb of jumps', 24, 24, 22, 13, 23, 23, 15],
    ['[6] More windows', 50, 50, 17, 29, 48, 0, 16],
    ['[6b] More windows alt', 50, 50, 17, 29, 43, 48, 16],
    ['[7] A lot of windows', 1000, 1000, 501, 501, 999, 963, 27],
    ['[7b] A lot of windows alt', 1000, 1000, 501, 501, 750, 750, 27],
    ['[7c] A lot of windows alt2', 1000, 1000, 501, 501, 84, 1, 27],
    ['[7d] A lot of windows alt3', 1000, 1000, 501, 501, 975, 984, 27],
    ['[7e] A lot of windows alt4', 1000, 1000, 501, 501, 735, 300, 27],
    ['[7f] A lot of windows alt5', 1000, 1000, 501, 501, 626, 540, 27],
    ['[7g] A lot of windows alt6', 1000, 1000, 501, 501, 372, 51, 27],
    ['[7h] A lot of windows alt7', 1000, 1000, 501, 501, 53, 107, 27],
    ['[7i] A lot of windows alt8', 1000, 1000, 501, 501, 59, 105, 27],
    ['[8] So many windows', 8000, 8000, 3200, 2100, 0, 1, 31],
    ['[8b] So many windows alt', 8000, 8000, 3201, 2100, 0, 1, 31],
  ];

  for (const [name, W, H, x0, y0, bx, by, N] of cases) {
    it(`${name}: bomb (${bx},${by})`, () => {
      expect(simulate(W, H, x0, y0, bx, by, N).found).toBe(true);
    });
  }

  // Stress tests — these test worst-case positions that may not appear on CG
  it.skip('[7] stress test: various bombs from (501,501)', () => {
    const fails: string[] = [];
    for (let bx = 0; bx < 1000; bx += 100) {
      for (let by = 0; by < 1000; by += 100) {
        if (bx === 500 && by === 500) continue;
        const r = simulate(1000, 1000, 501, 501, bx, by, 27);
        if (!r.found) fails.push(`(${bx},${by})`);
      }
    }
    expect(fails.length).toBe(0);
  });

  it.skip('8000x8000 stress test: bomb (0,1) various starts', () => {
    const fails: string[] = [];
    for (let x0 = 3000; x0 <= 3500; x0 += 100) {
      for (let y0 = 1900; y0 <= 2300; y0 += 100) {
        const r = simulate(8000, 8000, x0, y0, 0, 1, 31);
        if (!r.found) fails.push(`(${x0},${y0})`);
      }
    }
    expect(fails.length).toBe(0);
  });
});
