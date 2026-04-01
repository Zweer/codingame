const [W, H] = readline().split(' ').map(Number);
const grid: string[][] = [];
const balls: { x: number; y: number; shots: number }[] = [];
const holes: { x: number; y: number }[] = [];

for (let y = 0; y < H; y++) {
  const line = readline();
  grid.push(line.split(''));
  for (let x = 0; x < W; x++) {
    const c = line[x];
    if (c >= '1' && c <= '9') balls.push({ x, y, shots: Number(c) });
    else if (c === 'H') holes.push({ x, y });
  }
}

// Output grid for arrows
const out: string[][] = Array.from({ length: H }, () => Array(W).fill('.'));

// Track occupied cells (by arrows, balls, holes)
const occupied = new Uint8Array(W * H);
// Mark balls and holes as occupied
for (const b of balls) occupied[b.y * W + b.x] = 1;
for (const h of holes) occupied[h.y * W + h.x] = 1;

const DX = [0, 1, 0, -1]; // down, right, up, left
const DY = [1, 0, -1, 0];
const ARROWS = ['v', '>', '^', '<'];

// For each ball, try to find a path to a hole using backtracking
// A ball with shot count S moves S cells first, then S-1, then S-2, ... until 0 or it lands in a hole.

const holeUsed = new Uint8Array(holes.length);

function tryBall(bi: number): boolean {
  if (bi === balls.length) return true;

  const ball = balls[bi];
  // Unmark ball position as occupied (so we can use it as start)
  occupied[ball.y * W + ball.x] = 0;

  if (shootBall(bi, ball.x, ball.y, ball.shots)) return true;

  occupied[ball.y * W + ball.x] = 1;
  return false;
}

function shootBall(bi: number, sx: number, sy: number, shotsLeft: number): boolean {
  if (shotsLeft === 0) return false; // Must land in a hole, not just stop

  // Try each direction
  for (let d = 0; d < 4; d++) {
    const len = shotsLeft;
    const ex = sx + DX[d] * len;
    const ey = sy + DY[d] * len;

    // Check bounds
    if (ex < 0 || ex >= W || ey < 0 || ey >= H) continue;

    // Check that landing cell is not water
    if (grid[ey][ex] === 'X') continue;

    // Check that all cells along the arrow (except landing cell) are free
    let valid = true;
    for (let step = 1; step < len; step++) {
      const cx = sx + DX[d] * step;
      const cy = sy + DY[d] * step;
      if (occupied[cy * W + cx]) { valid = false; break; }
    }
    if (!valid) continue;

    // Check landing cell: must be either a free hole or a free cell (for further shots)
    const landIdx = ey * W + ex;

    // Check if landing on a hole
    let holeIdx = -1;
    for (let hi = 0; hi < holes.length; hi++) {
      if (!holeUsed[hi] && holes[hi].x === ex && holes[hi].y === ey) {
        holeIdx = hi;
        break;
      }
    }

    // Mark arrow cells as occupied
    const arrowCells: [number, number][] = [];
    for (let step = 0; step < len; step++) {
      const cx = sx + DX[d] * step;
      const cy = sy + DY[d] * step;
      occupied[cy * W + cx] = 1;
      out[cy][cx] = ARROWS[d];
      arrowCells.push([cx, cy]);
    }

    if (holeIdx >= 0) {
      // Ball lands in hole — done with this ball
      holeUsed[holeIdx] = 1;
      if (tryBall(bi + 1)) return true;
      holeUsed[holeIdx] = 0;
    } else if (shotsLeft - 1 > 0 && !occupied[landIdx]) {
      // Ball lands on free cell, continue shooting with shotsLeft - 1
      if (shootBall(bi, ex, ey, shotsLeft - 1)) return true;
    }

    // Undo arrow
    for (const [cx, cy] of arrowCells) {
      occupied[cy * W + cx] = 0;
      out[cy][cx] = '.';
    }
  }

  return false;
}

// Sort balls by shots descending (most constrained first — balls with more shots have fewer options)
balls.sort((a, b) => b.shots - a.shots);

tryBall(0);

for (let y = 0; y < H; y++) console.log(out[y].join(''));
