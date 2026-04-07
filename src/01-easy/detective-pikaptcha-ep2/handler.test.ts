import { describe, expect, it } from 'vitest';

import { Game } from './handler.js';

describe('detective-pikaptcha-ep2', () => {
  it('test 1 — L wall following', () => {
    expect(new Game(['>000#', '#0#00', '00#0#'], 'L').solve()).toEqual(['1322#', '#2#31', '12#1#']);
  });

  it('test 2 — R wall following', () => {
    expect(new Game(['#00###000', '0000<0000', '000##0000'], 'R').solve()).toEqual(['#11###000', '112210000', '111##0000']);
  });

  it('test 3 — isolated cell', () => {
    expect(new Game(['0#0', '#>#', '0#0'], 'L').solve()).toEqual(['0#0', '#0#', '0#0']);
  });

  it('test 5 — R wall following partial maze', () => {
    expect(new Game(['00000#0', '0#0#000', '00#0^##', '000#000', '#0#00#0', '0#00#00'], 'R').solve())
      .toEqual(['22322#1', '2#1#322', '21#01##', '131#000', '#1#00#0', '0#00#00']);
  });
});
