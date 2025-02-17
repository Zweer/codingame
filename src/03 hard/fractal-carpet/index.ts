/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

declare function readline(): string; // Assuming a readline function is available

type Thread = '0' | '+';
type Carpet = Thread[][];

class Game2 {
  protected level: number;
  protected x1: number;
  protected y1: number;
  protected x2: number;
  protected y2: number;

  constructor() {
    this.level = parseInt(readline(), 10);
    console.error('level:', this.level);

    [this.x1, this.y1, this.x2, this.y2] = readline().split(' ').map(Number);
    console.error('X1:', this.x1);
    console.error('Y1:', this.y1);
    console.error('X2:', this.x2);
    console.error('Y2:', this.y2);
  }

  solve() {
    const carpet: Carpet = this.createCarpet();
    this.print(carpet, true);

    const patch = this.extractPatch(carpet, this.x1, this.y1, this.x2, this.y2);
    this.print(patch);
  }

  protected createCarpet(pattern: Carpet = [['0']], level = 0): Carpet {
    if (this.level === level) {
      return pattern;
    }

    const initialWidth = pattern.length;
    const initialHeight = pattern[0].length;

    for (let i = 0; i < 3; i += 1) {
      for (let j = 0; j < initialWidth; j += 1) {
        const original = JSON.parse(JSON.stringify(pattern[j]));
        const index = j + i * initialHeight;

        if (pattern[index]) {
          pattern[index].push(...original);
          pattern[index].push(...original);
        } else {
          pattern[index] = original;
        }
      }
    }

    this.extractPatch(
      pattern,
      initialWidth,
      initialHeight,
      initialWidth * 2 - 1,
      initialHeight * 2 - 1,
      true,
    );

    return this.createCarpet(pattern, level + 1);
  }

  protected extractPatch(
    carpet: Carpet,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    replace = false,
  ): Carpet {
    const patch: Carpet = [];
    for (let x = x1, i = 0; x <= x2; x += 1, i += 1) {
      for (let y = y1, j = 0; y <= y2; y += 1, j += 1) {
        if (!patch[j]) {
          patch[j] = [];
        }

        patch[j][i] = carpet[y][x];

        if (replace) {
          carpet[y][x] = '+';
        }
      }
    }

    return patch;
  }

  protected print(patch: Carpet, debug = false): void {
    console[debug ? 'error' : 'log'](patch.map((row) => row.join('')).join('\n'));
  }
}

class Game {
  protected level: number;
  protected x1: number;
  protected y1: number;
  protected x2: number;
  protected y2: number;

  constructor() {
    this.level = parseInt(readline(), 10);
    console.error('level:', this.level);

    [this.x1, this.y1, this.x2, this.y2] = readline().split(' ').map(Number);
    console.error('X1:', this.x1);
    console.error('Y1:', this.y1);
    console.error('X2:', this.x2);
    console.error('Y2:', this.y2);
  }

  solve() {
    const patch = [];
    for (let j = this.y1; j <= this.y2; j++) {
      for (let i = this.x1; i <= this.x2; i++) {
        let aaa = i;
        let bbb = j;
        let cond = true;

        while (aaa !== 0 || bbb !== 0) {
          if (aaa % 3 === 1 && bbb % 3 === 1) {
            cond = false;
            break;
          }

          aaa = Math.floor(aaa / 3);
          bbb = Math.floor(bbb / 3);
        }

        patch.push(cond ? '0' : '+');
      }
      patch.push('\n');
    }

    console.log(patch.join('').trim());
  }
}

new Game().solve();
