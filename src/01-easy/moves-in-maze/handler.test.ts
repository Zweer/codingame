import { describe, expect, it } from 'vitest';

import { solve } from './handler.js';

describe('moves-in-maze', () => {
  it('should solve the example', () => {
    const grid = [
      '##########',
      '#S.......#',
      '##.#####.#',
      '##.#.....#',
      '##########',
    ];
    expect(solve(grid)).toEqual([
      '##########',
      '#01234567#',
      '##2#####8#',
      '##3#DCBA9#',
      '##########',
    ]);
  });
});
