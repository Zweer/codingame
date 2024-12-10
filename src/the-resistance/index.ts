/* eslint-disable id-length */
declare function readline(): string; // Assuming a readline function is available

class Game {
  static LETTERS: Record<string, string> = {
    A: '.-',
    B: '-...',
    C: '-.-.',
    D: '-..',
    E: '.',
    F: '..-.',
    G: '--.',
    H: '....',
    I: '..',
    J: '.---',
    K: '-.-',
    L: '.-..',
    M: '--',
    N: '-.',
    O: '---',
    P: '.--.',
    Q: '--.-',
    R: '.-.',
    S: '...',
    T: '-',
    U: '..-',
    V: '...-',
    W: '.--',
    X: '-..-',
    Y: '-.--',
    Z: '--..',
  };

  static convert(word: string): string {
    const morseLetters: string[] = [];
    for (const letter of word) {
      morseLetters.push(Game.LETTERS[letter]);
    }

    return morseLetters.join('');
  }

  sequence: string;
  dictionary: Record<string, number> = {};
  cache: Record<number, number> = {};

  constructor() {
    this.sequence = readline();
    console.error('Sequence:', this.sequence);

    const wordsCount = parseInt(readline(), 10);
    console.error('Words:');
    for (let i = 0; i < wordsCount; i++) {
      const word = readline();
      const morseWord = Game.convert(word);
      console.error(`  ${word} -> ${morseWord}`);

      if (!this.dictionary[morseWord]) {
        this.dictionary[morseWord] = 0;
      }
      this.dictionary[morseWord]++;
    }

    console.error('Dictionary:', this.dictionary);
  }

  solve(index = 0): number {
    if (index === this.sequence.length) {
      return 1;
    }

    if (index in this.cache) {
      return this.cache[index];
    }

    let count = 0;
    for (const key of Object.keys(this.dictionary)) {
      for (let i = 0; i < this.dictionary[key]; i++) {
        if (this.sequence.startsWith(key, index)) {
          count += this.solve(index + key.length);
        }
      }
    }

    this.cache[index] = count;

    return count;
  }
}

if (process.env.NODE_ENV !== 'test') {
  const game = new Game();
  const solution = game.solve();
  console.error(game.cache);
  console.log(solution);
}
