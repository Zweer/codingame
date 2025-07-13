declare function readline(): string; // Assuming a readline function is available

enum Direction {
  Right = 'RIGHT',
  Left = 'LEFT',
}

enum Command {
  Wait = 'WAIT',
  Block = 'BLOCK',
}

interface Point {
  x: number;
  y: number;
}

class Game {
  width: number;
  height: number;
  exit: Point;
  elevators: Point[] = [];
  start!: Point;
  breakPoints: Point[] = [];

  constructor() {
    const [height, width, rounds, exitY, exitX, clones, additionalElevators, elevators] = readline()
      .split(' ')
      .map(input => Number.parseInt(input, 10));
    this.width = width;
    this.height = height;
    this.exit = { x: exitX, y: exitY };

    console.error('width:', width);
    console.error('height:', height);
    console.error('exit:', this.exit);
    console.error('rounds:', rounds);
    console.error('clones:', clones);
    console.error('elevators:', elevators);

    for (let i = 0; i < elevators; i += 1) {
      const [elevatorY, elevatorX] = readline()
        .split(' ')
        .map(input => Number.parseInt(input, 10));
      const elevator = { x: elevatorX, y: elevatorY };
      this.elevators.push(elevator);
      console.error('elevator:', elevator);
    }
  }

  turn() {
    const [inputY, inputX, direction] = readline().split(' ');
    const x = Number.parseInt(inputX, 10);
    const y = Number.parseInt(inputY, 10);

    console.error('current leading position:', { x, y });

    if (!this.start) {
      this.start = { x, y };
      const cursor = { x, y };
      let cursorDirection = Direction.Right;

      while (cursor.x !== this.exit.x || cursor.y !== this.exit.y) {
        const destination
          = cursor.y === this.exit.y
            ? this.exit
            : (this.elevators.find(elevator => elevator.y === cursor.y) as Point);

        if (cursor.x === destination.x) {
          cursor.y++;
          continue;
        }

        if (cursor.x > destination.x && cursorDirection === Direction.Right) {
          cursorDirection = Direction.Left;
          this.breakPoints.push({ x: cursor.x, y: cursor.y });
        } else if (cursor.x < destination.x && cursorDirection === Direction.Left) {
          cursorDirection = Direction.Right;
          this.breakPoints.push({ x: cursor.x, y: cursor.y });
        }

        cursor.x += cursorDirection === Direction.Right ? 1 : -1;
      }

      console.error('breakpoints:', this.breakPoints);
    }

    if (this.breakPoints.some(breakpoint => breakpoint.x === x && breakpoint.y === y)) {
      this.breakPoints.shift();
      console.log(Command.Block);
    } else {
      console.log(Command.Wait);
    }
  }
}

const game = new Game();

while (true) {
  game.turn();
}
