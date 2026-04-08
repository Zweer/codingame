const DIR = { UP: 'C', RIGHT: 'A', DOWN: 'D', LEFT: 'E', STAY: 'B' } as const;

type Dir = 'UP' | 'RIGHT' | 'DOWN' | 'LEFT' | 'STAY';

interface Pos {
  x: number;
  y: number;
}

export class Game {
  readonly width: number;
  readonly height: number;
  readonly playerCount: number;
  readonly grid: string[][];

  constructor(width: number, height: number, playerCount: number) {
    this.width = width;
    this.height = height;
    this.playerCount = playerCount;
    this.grid = Array.from({ length: height }, () => Array(width).fill('?'));
  }

  turn(up: string, right: string, down: string, left: string, positions: Pos[]): string {
    const me = positions[positions.length - 1];
    const enemies = positions.slice(0, -1);

    // Update grid with observations
    this.grid[me.y][me.x] = '_';
    this.grid[(me.y - 1 + this.height) % this.height][me.x] = up;
    this.grid[(me.y + 1) % this.height][me.x] = down;
    this.grid[me.y][(me.x + 1) % this.width] = right;
    this.grid[me.y][(me.x - 1 + this.width) % this.width] = left;

    for (const e of enemies) this.grid[e.y][e.x] = '_';

    const hasEnemy = (x: number, y: number): boolean =>
      enemies.some(
        (e) =>
          e.x === ((x % this.width) + this.width) % this.width &&
          e.y === ((y % this.height) + this.height) % this.height,
      );

    const isSafe = (x: number, y: number): boolean =>
      !hasEnemy(x, y) &&
      !hasEnemy(x - 1, y) &&
      !hasEnemy(x + 1, y) &&
      !hasEnemy(x, y - 1) &&
      !hasEnemy(x, y + 1);

    const canMove = (x: number, y: number): boolean =>
      this.grid[((y % this.height) + this.height) % this.height][
        ((x % this.width) + this.width) % this.width
      ] !== '#';

    // BFS to nearest '?' cell through safe moves
    const target = this.bfsToUnknown(me, canMove, isSafe, hasEnemy);
    if (target) return DIR[target];

    // Fallback: any safe move
    return this.fallbackMove(me, canMove, isSafe, hasEnemy);
  }

  private bfsToUnknown(
    me: Pos,
    canMove: (x: number, y: number) => boolean,
    isSafe: (x: number, y: number) => boolean,
    hasEnemy: (x: number, y: number) => boolean,
  ): Dir | null {
    const visited = new Set<number>();
    const key = (x: number, y: number): number => y * this.width + x;
    const queue: Array<{ x: number; y: number; firstDir: Dir }> = [];

    visited.add(key(me.x, me.y));

    const neighbors: Array<{ dx: number; dy: number; dir: Dir }> = [
      { dx: 0, dy: -1, dir: 'UP' },
      { dx: 1, dy: 0, dir: 'RIGHT' },
      { dx: 0, dy: 1, dir: 'DOWN' },
      { dx: -1, dy: 0, dir: 'LEFT' },
    ];

    for (const { dx, dy, dir } of neighbors) {
      const nx = (me.x + dx + this.width) % this.width;
      const ny = (me.y + dy + this.height) % this.height;
      if (canMove(nx, ny) && isSafe(nx, ny)) {
        if (this.grid[ny][nx] === '?') return dir;
        visited.add(key(nx, ny));
        queue.push({ x: nx, y: ny, firstDir: dir });
      }
    }

    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;
      const { x, y, firstDir } = item;
      for (const { dx, dy } of neighbors) {
        const nx = (x + dx + this.width) % this.width;
        const ny = (y + dy + this.height) % this.height;
        const k = key(nx, ny);
        if (visited.has(k)) continue;
        if (!canMove(nx, ny)) continue;
        // For BFS beyond first step, only check walls (enemies will move)
        if (hasEnemy(nx, ny)) continue;
        visited.add(k);
        if (this.grid[ny][nx] === '?') return firstDir;
        queue.push({ x: nx, y: ny, firstDir });
      }
    }

    return null;
  }

  private fallbackMove(
    me: Pos,
    canMove: (x: number, y: number) => boolean,
    isSafe: (x: number, y: number) => boolean,
    hasEnemy: (x: number, y: number) => boolean,
  ): string {
    const moves: Array<{ dir: Dir; x: number; y: number }> = [
      { dir: 'UP', x: me.x, y: (me.y - 1 + this.height) % this.height },
      { dir: 'RIGHT', x: (me.x + 1) % this.width, y: me.y },
      { dir: 'DOWN', x: me.x, y: (me.y + 1) % this.height },
      { dir: 'LEFT', x: (me.x - 1 + this.width) % this.width, y: me.y },
    ];

    // Try safe moves first
    for (const m of moves) {
      if (canMove(m.x, m.y) && isSafe(m.x, m.y)) return DIR[m.dir];
    }

    // Try moves that just avoid direct enemy collision
    for (const m of moves) {
      if (canMove(m.x, m.y) && !hasEnemy(m.x, m.y)) return DIR[m.dir];
    }

    // Try attacking an adjacent enemy
    for (const m of moves) {
      if (hasEnemy(m.x, m.y)) return DIR[m.dir];
    }

    return DIR.STAY;
  }
}
