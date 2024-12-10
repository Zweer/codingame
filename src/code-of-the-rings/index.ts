declare function readline(): string; // Assuming a readline function is available

export class Game {
  static readonly LETTERS_PLUS = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  static readonly LETTERS_MINUS: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'
    .split('')
    .reverse()
    .join('');

  static closestPlus(char: string): number {
    return Game.LETTERS_PLUS.indexOf(char);
  }

  static closestMinus(char: string): number {
    return Game.LETTERS_MINUS.indexOf(char);
  }

  private letters: Record<string, number> = {};
  private positions: Record<number, string> = {};
  private builded: Record<string, boolean> = {};

  private path = '';
  private currentPosition = 15;

  constructor(readonly magicPhrase: string) {
    this.magicPhrase = this.magicPhrase.replace(/ /g, '#');
  }

  private optimizeSteps(count: number, increment: boolean): string {
    if (count <= 1) {
      return (increment ? '+' : '-').repeat(count);
    }
    const simpleSteps = (increment ? '+' : '-').repeat(count);
    const loopSteps = `${increment ? '+' : '-'}>[<${increment ? '+' : '-'}>-]`;
    return loopSteps.length < simpleSteps.length ? loopSteps : simpleSteps;
  }

  public getAllLetters(): void {
    let lastPosition = this.currentPosition;

    for (const char of this.magicPhrase) {
      if (!(char in this.letters)) {
        this.letters[char] = lastPosition;
        this.positions[lastPosition] = char;
        this.builded[char] = false;
        lastPosition++;
      }
    }
  }

  public buildPath(): string {
    for (const char of this.magicPhrase) {
      const step = this.currentPosition < this.letters[char] ? 1 : -1;
      while (this.currentPosition !== this.letters[char]) {
        if (step > 0) {
          this.path += '>';
          this.currentPosition++;
        } else {
          this.path += '<';
          this.currentPosition--;
        }
      }

      if (!this.builded[char]) {
        this.builded[char] = true;
        const plus = Game.closestPlus(char);
        const minus = Game.closestMinus(char);
        const increment = plus < minus;
        const count = increment ? plus : minus;

        // Optimize steps with loops if it reduces character count
        this.path += this.optimizeSteps(count, increment);
      }

      this.path += '.';
    }

    return this.path;
  }
}

if (process.env.NODE_ENV !== 'test') {
  const game = new Game(readline());
  game.getAllLetters();
  console.log(game.buildPath());
}
