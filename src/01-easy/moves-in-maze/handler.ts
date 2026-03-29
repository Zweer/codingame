const DIRS = [[0, 1], [0, -1], [1, 0], [-1, 0]] as const;
const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function solve(grid: string[]): string[] {
  const h = grid.length;
  const w = grid[0].length;
  const dist: number[][] = Array.from({ length: h }, () => Array(w).fill(-1));

  let startR = 0;
  let startC = 0;
  for (let r = 0; r < h; r++)
    for (let c = 0; c < w; c++)
      if (grid[r][c] === 'S') { startR = r; startC = c; }

  dist[startR][startC] = 0;
  const queue: [number, number][] = [[startR, startC]];

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    for (const [dr, dc] of DIRS) {
      const nr = (r + dr + h) % h;
      const nc = (c + dc + w) % w;
      if (grid[nr][nc] !== '#' && dist[nr][nc] === -1) {
        dist[nr][nc] = dist[r][c] + 1;
        queue.push([nr, nc]);
      }
    }
  }

  return dist.map((row, r) =>
    row.map((d, c) => grid[r][c] === '#' ? '#' : d === -1 ? '.' : CHARS[d]).join(''),
  );
}
