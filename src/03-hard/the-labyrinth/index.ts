enum CellValue {
  WALL = '#',
  EMPTY = '.',
  START = 'T',
  CONTROL = 'C',
  UNKNOWN = '?',
}

enum Command {
  UP = 'UP',
  LEFT = 'LEFT',
  DOWN = 'DOWN',
  RIGHT = 'RIGHT',
}

class Maze {
  private cells: Cell[][];

  get transpose(): Cell[][] {
    return this.cells[0].map((_, colIndex) => this.cells.map(row => row[colIndex]));
  }

  constructor(public readonly rows: number, public readonly columns: number) {
    this.cells = [];
    for (let i = 0; i < columns; i += 1) {
      this.cells[i] = [];
    }
  }

  getCell(x, y): Cell {
    if (x >= this.columns || y >= this.rows) {
      throw new Error(`Cell (${x},${y}) out of bounds`);
    }

    return this.cells[x][y];
  }

  putCell(x, y, cell: Cell): void {
    if (x >= this.columns || y >= this.rows) {
      throw new Error(`Cell (${x},${y}) out of bounds`);
    }

    this.cells[x][y] = cell;
  }

  toString(): string {
    return this.transpose.map(row => row.map(cell => cell.toString()).join('')).join('\n');
  }
}

class Point {
  constructor(public readonly x: number, public readonly y: number) {}

  equal(point: Point): boolean {
    return this.x === point.x && this.y === point.y;
  }
}

class Cell extends Point {
  get neighbors(): Cell[] {
    const neighbors: Cell[] = [];

    if (this.x > 0) {
      neighbors.push(this.maze.getCell(this.x - 1, this.y));
    }
    if (this.x < this.maze.columns - 1) {
      neighbors.push(this.maze.getCell(this.x + 1, this.y));
    }
    if (this.y > 0) {
      neighbors.push(this.maze.getCell(this.x, this.y - 1));
    }
    if (this.y < this.maze.rows - 1) {
      neighbors.push(this.maze.getCell(this.x, this.y + 1));
    }

    return neighbors;
  }

  constructor(
    public readonly maze: Maze,
    public readonly x: number,
    public readonly y: number,
    public readonly value: CellValue,
  ) {
    super(x, y);
  }

  toString(): string {
    return this.value;
  }

  toCoord(): string {
    return `(${this.x},${this.y})`;
  }
}

class Game {
  rows: number;
  columns: number;
  alarm: number;

  maze: Maze;

  player: Point;
  start: Point;
  control: Point;

  wayBack = false;
  mazeExplored = false;
  moves: string[] = [];

  jetpackEnergy = 1200;
  turnCount = 0;

  initialize() {
    const [inputRows, inputColumns, inputAlarm]: string[] = readline().split(' ');
    this.rows = Number.parseInt(inputRows, 10); // number of rows.
    this.columns = Number.parseInt(inputColumns, 10); // number of columns.
    this.alarm = Number.parseInt(inputAlarm, 10); // number of rounds between the time the alarm countdown is activated and the time the alarm goes off.

    // console.error(this.rows, this.columns, this.alarm);
  }

  initializePlayer() {
    const [rInput, cInput]: string[] = readline().split(' ');
    const y: number = Number.parseInt(rInput, 10); // row where Rick is located.
    const x: number = Number.parseInt(cInput, 10); // column where Rick is located.
    this.player = new Point(x, y);
    if (!this.start) {
      this.start = this.player;
    }
  }

  initializeTurn() {
    this.initializePlayer();

    this.maze = new Maze(this.rows, this.columns);
    for (let y = 0; y < this.rows; y += 1) {
      const row = readline(); // C of the characters in '#.TC?' (i.e. one line of the ASCII maze).
      for (let x = 0; x < this.columns; x += 1) {
        const cellValue = row[x] as CellValue;
        const cell = new Cell(this.maze, x, y, cellValue);
        this.maze.putCell(x, y, cell);

        if (cellValue === CellValue.CONTROL) {
          this.control = new Point(x, y);

          if (this.control.equal(this.player)) {
            this.wayBack = true;
          }
        }
      }
    }

    console.error(this.maze.toString());
    // console.error('start', this.start);
    console.error('player', this.player);
    // console.error('control', this.control);
    // console.error('actual', this.maze.getCell(this.player.x, this.player.y).toString());
  }

  turn() {
    const start = process.hrtime();

    this.turnCount += 1;
    this.jetpackEnergy -= 1;

    if (this.turnCount > 15) {
      // return;
    }

    this.initializeTurn();

    let cameFrom: Map<Cell, Cell>;
    let neighbor: Cell;

    if (!this.mazeExplored) {
      const toAvoid = [CellValue.WALL, CellValue.CONTROL];
      [cameFrom, neighbor] = this.bfs(CellValue.UNKNOWN, toAvoid);
      if (!cameFrom) {
        this.mazeExplored = true;
      }

      if (cameFrom) {
        console.error(
          'not explored',
          Array.from(cameFrom.entries()).map(([key, value]) => `${key.toCoord()} => ${value.toCoord()}`),
          neighbor.toCoord(),
        );
      } else {
        console.error('Finished exploring!');
      }
    }

    if (this.mazeExplored) {
      const toAvoid = [CellValue.WALL];
      if (!this.wayBack) {
        [cameFrom, neighbor] = this.bfs(CellValue.CONTROL, toAvoid);
      } else {
        [cameFrom, neighbor] = this.bfs(CellValue.START, toAvoid);
      }

      console.error(
        'explored',
        Array.from(cameFrom.entries()).map(([key, value]) => `${key.toCoord()} => ${value.toCoord()}`),
        neighbor.toCoord(),
      );
    }

    const path = this.reconstructPath(cameFrom, neighbor);
    console.error('path', path.map(cell => cell.toCoord()));

    const nextPosition = path[path.length - 2];
    console.error('nextPosition', nextPosition.toCoord());

    const nextMove = this.printNextMove(nextPosition);

    const end = process.hrtime(start);
    console.error(Math.round((end[0] + end[1] / 1e9) * 1e3), 'ms');
    console.log(nextMove);
  }

  bfs(goal: string, toAvoid: string[]): [Map<Cell, Cell>, Cell] {
    const playerCell = this.maze.getCell(this.player.x, this.player.y);
    const visited: Cell[] = [playerCell];
    const queue: Cell[] = [playerCell];
    const cameFrom: Map<Cell, Cell> = new Map();

    while (queue.length > 0) {
      const cell = queue.shift();
      for (const neighbor of cell.neighbors.filter(neighbor => !toAvoid.includes(neighbor.value))) {
        if (visited.every(visitedCell => !neighbor.equal(visitedCell))) {
          visited.push(neighbor);
          queue.push(neighbor);
          cameFrom.set(neighbor, cell);
          if (this.maze.getCell(neighbor.x, neighbor.y).value === goal) {
            return [cameFrom, neighbor];
          }
        }
      }
    }

    return [null, null];
  }

  reconstructPath(cameFrom: Map<Cell, Cell>, neighbor: Cell): Cell[] {
    let currentPosition = neighbor;
    const stack: Cell[] = [];
    while (cameFrom.get(currentPosition)) {
      stack.push(currentPosition);
      currentPosition = cameFrom.get(currentPosition);
    }
    stack.push(currentPosition);

    return stack;
  }

  printNextMove(nextPosition: Cell): string {
    if (this.player.x < nextPosition.x) {
      return 'RIGHT';
    }
    if (this.player.x > nextPosition.x) {
      return 'LEFT';
    }
    if (this.player.y < nextPosition.y) {
      return 'DOWN';
    }
    if (this.player.y > nextPosition.y) {
      return 'UP';
    }
  }
}

const game = new Game();
game.initialize();

while (true) {
  game.turn();
}
