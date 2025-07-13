declare function readline(): string; // Assuming a readline function is available

class Game {
  width: number;
  height: number;
  count: number;
  grid: string[][];

  constructor() {
    [this.width, this.height] = readline().split(' ').map(Number);
    console.error('width:', this.width);
    console.error('height:', this.height);

    this.count = Number.parseInt(readline(), 10);
    console.error('count:', this.count);

    this.grid = Array.from({ length: this.height }, () => new Array(this.width).fill(' '));

    for (let i = 0; i < this.count; i += 1) {
      const [grain, xStr] = readline().split(' ');
      let x = Number.parseInt(xStr, 10);
      let y = -1;

      while (true) {
        if (y + 1 < this.height && this.grid[y + 1][x] === ' ') {
          y++;
          continue;
        }

        const isLowercase = grain.toLowerCase() === grain;

        if (isLowercase) {
          // Try to move down-right
          if (y + 1 < this.height && x + 1 < this.width && this.grid[y + 1][x + 1] === ' ') {
            y++;
            x++;
            continue;
          }
          // Try to move down-left
          if (y + 1 < this.height && x - 1 >= 0 && this.grid[y + 1][x - 1] === ' ') {
            y++;
            x--;
            continue;
          }
        } else {
          // Uppercase
          // Try to move down-left
          if (y + 1 < this.height && x - 1 >= 0 && this.grid[y + 1][x - 1] === ' ') {
            y++;
            x--;
            continue;
          }
          // Try to move down-right
          if (y + 1 < this.height && x + 1 < this.width && this.grid[y + 1][x + 1] === ' ') {
            y++;
            x++;
            continue;
          }
        }

        // If no move was made, the grain has settled
        break;
      }

      if (y >= 0) {
        this.grid[y][x] = grain;
      }
    }
  }

  printSolution() {
    for (let i = 0; i < this.height; i++) {
      console.log(`|${this.grid[i].join('')}|`);
    }
    console.log(`+${'-'.repeat(this.width)}+`);
  }
}

const game = new Game();
game.printSolution();
