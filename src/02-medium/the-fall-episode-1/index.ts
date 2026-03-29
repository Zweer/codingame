// exits[type][entry] = [dx, dy] offset to next room
const E: Record<number, Record<string, [number, number]>> = {
  1:  { TOP: [0,1], LEFT: [0,1], RIGHT: [0,1] },
  2:  { LEFT: [1,0], RIGHT: [-1,0] },
  3:  { TOP: [0,1] },
  4:  { TOP: [-1,0], RIGHT: [0,1] },
  5:  { TOP: [1,0], LEFT: [0,1] },
  6:  { LEFT: [1,0], RIGHT: [-1,0] },
  7:  { TOP: [0,1], RIGHT: [0,1] },
  8:  { LEFT: [0,1], RIGHT: [0,1] },
  9:  { TOP: [0,1], LEFT: [0,1] },
  10: { TOP: [-1,0] },
  11: { TOP: [1,0] },
  12: { RIGHT: [0,1] },
  13: { LEFT: [0,1] },
};

const [W, H] = readline().split(' ').map(Number);
const grid: number[][] = [];
for (let i = 0; i < H; i++) grid.push(readline().split(' ').map(Number));
readline(); // EX (not needed for episode 1)

while (true) {
  const parts = readline().split(' ');
  const x = Number(parts[0]), y = Number(parts[1]), pos = parts[2];
  const room = Math.abs(grid[y][x]);
  const exit = E[room]?.[pos];
  if (exit) console.log(`${x + exit[0]} ${y + exit[1]}`);
}
