import { describe, expect, it } from 'vitest';

import { isHappy } from './handler.js';

describe('happy-numbers', () => {
  it('23 is happy', () => expect(isHappy('23')).toBe(true));
  it('24 is unhappy', () => expect(isHappy('24')).toBe(false));
  it('1 is happy', () => expect(isHappy('1')).toBe(true));
  it('7 is happy', () => expect(isHappy('7')).toBe(true));
  it('4 is unhappy', () => expect(isHappy('4')).toBe(false));
  it('handles big number', () => expect(isHappy('99999999999999999999999999')).toBe(false));
});
