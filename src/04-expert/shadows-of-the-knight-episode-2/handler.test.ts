import { describe, expect, it } from 'vitest';

import { initState, step } from './handler.js';

/** Simulate the game: returns true if bomb found within maxTurns */
function simulate(W: number, H: number, x0: number, y0: number, bombX: number, bombY: number, maxTurns: number, verbose = false): boolean {
  const s = initState(W, H, x0, y0);
  let prevDist = Infinity;

  for (let t = 0; t < maxTurns; t++) {
    const curDist = Math.sqrt((s.cx - bombX) ** 2 + (s.cy - bombY) ** 2);
    let hint: string;
    if (t === 0) {
      hint = 'UNKNOWN';
    } else if (curDist < prevDist) {
      hint = 'WARMER';
    } else if (curDist > prevDist) {
      hint = 'COLDER';
    } else {
      hint = 'SAME';
    }

    if (verbose) console.log(`T${t}: pos=(${s.cx},${s.cy}) dist=${curDist.toFixed(2)} hint=${hint} x=[${s.xLo},${s.xHi}] y=[${s.yLo},${s.yHi}] doingX=${s.doingX}`);

    prevDist = curDist;
    const [nx, ny] = step(s, hint);

    if (verbose) console.log(`  -> jump to (${nx},${ny})`);
    if (nx === bombX && ny === bombY) return true;
    if (nx < 0 || nx >= W || ny < 0 || ny >= H) return false;
  }
  return false;
}

describe('shadows-of-the-knight-episode-2', () => {
  it('example: 10x10, start (2,5), bomb (7,4)', () => {
    expect(simulate(10, 10, 2, 5, 7, 4, 10, true)).toBe(true);
  });

  it('simple: 1D horizontal', () => {
    expect(simulate(100, 1, 0, 0, 73, 0, 20)).toBe(true);
  });

  it('simple: 1D vertical', () => {
    expect(simulate(1, 100, 0, 0, 0, 73, 20)).toBe(true);
  });

  it('corner: bomb at (0,0)', () => {
    expect(simulate(50, 50, 25, 25, 0, 0, 20)).toBe(true);
  });

  it('corner: bomb at (W-1,H-1)', () => {
    expect(simulate(50, 50, 0, 0, 49, 49, 20)).toBe(true);
  });

  it('large grid', () => {
    expect(simulate(10000, 10000, 5000, 5000, 1234, 8765, 50)).toBe(true);
  });

  it('start on bomb X', () => {
    expect(simulate(20, 20, 7, 0, 7, 15, 15)).toBe(true);
  });

  it('start on bomb Y', () => {
    expect(simulate(20, 20, 0, 8, 15, 8, 15)).toBe(true);
  });
});
