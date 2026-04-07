enum Dir { Up, Right, Down, Left }

const DR = [-1, 0, 1, 0];
const DC = [0, 1, 0, -1];
const DIR_CHAR: Record<string, Dir> = { '^': Dir.Up, '>': Dir.Right, v: Dir.Down, '<': Dir.Left };
const DIR_LABEL = ['↑', '→', '↓', '←'];

export class Game {
  private readonly rows: number;
  private readonly cols: number;
  private readonly wall: boolean[][];
  private readonly visits: number[][];
  private readonly priority: number[];
  private readonly debug: boolean;

  private row: number;
  private col: number;
  private dir: Dir;

  private readonly startRow: number;
  private readonly startCol: number;

  constructor(maze: string[], side: string, debug = false) {
    this.debug = debug;
    this.rows = maze.length;
    this.cols = maze[0].length;
    // wall-side, straight, opposite-side (NOT behind)
    this.priority = side === 'L' ? [3, 0, 1] : [1, 0, 3];

    this.wall = maze.map((line) => [...line].map((ch) => ch === '#'));
    this.visits = maze.map((line) => [...line].map(() => 0));

    this.row = 0;
    this.col = 0;
    this.dir = Dir.Up;
    for (let r = 0; r < this.rows; r++)
      for (let c = 0; c < this.cols; c++)
        if (maze[r][c] in DIR_CHAR) {
          this.row = r;
          this.col = c;
          this.dir = DIR_CHAR[maze[r][c]];
        }

    this.startRow = this.row;
    this.startCol = this.col;
  }

  private isOpen(r: number, c: number): boolean {
    return r >= 0 && r < this.rows && c >= 0 && c < this.cols && !this.wall[r][c];
  }

  private hasAnyNeighbor(): boolean {
    for (let d = 0; d < 4; d++)
      if (this.isOpen(this.row + DR[d], this.col + DC[d])) return true;
    return false;
  }

  /** Try to move in one of the 3 priority directions. Returns true if moved. */
  private tryMove(): boolean {
    for (const offset of this.priority) {
      const nd = ((this.dir + offset) % 4) as Dir;
      const nr = this.row + DR[nd];
      const nc = this.col + DC[nd];
      if (this.isOpen(nr, nc)) {
        if (this.debug) console.error(`(${this.row},${this.col}) ${DIR_LABEL[this.dir]} → ${DIR_LABEL[nd]} to (${nr},${nc})`);
        this.visits[this.row][this.col]++;
        this.dir = nd;
        this.row = nr;
        this.col = nc;
        return true;
      }
    }
    return false;
  }

  /** Rotate 180° without moving or counting */
  private turnAround(): void {
    const nd = ((this.dir + 2) % 4) as Dir;
    if (this.debug) console.error(`(${this.row},${this.col}) ${DIR_LABEL[this.dir]} → 180° to ${DIR_LABEL[nd]}`);
    this.dir = nd;
  }

  solve(): string[] {
    if (!this.hasAnyNeighbor()) return this.formatResult();

    // Phase 1: initial rotations until first move (handles dead-end starts)
    while (!this.tryMove()) {
      this.turnAround();
    }

    // Phase 2: keep going until back at start position
    while (this.row !== this.startRow || this.col !== this.startCol) {
      if (!this.tryMove()) {
        this.turnAround();
      }
    }

    return this.formatResult();
  }

  private formatResult(): string[] {
    return this.visits.map((row, r) =>
      row.map((v, c) => (this.wall[r][c] ? '#' : String(v))).join(''),
    );
  }
}
