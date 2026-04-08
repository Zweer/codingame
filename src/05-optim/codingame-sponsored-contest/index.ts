import { Game } from './handler.js';

// @ts-expect-error — CodinGame global
const rl = readline;

const width = Number.parseInt(rl(), 10);
const height = Number.parseInt(rl(), 10);
const players = Number.parseInt(rl(), 10);

const game = new Game(width, height, players);

while (true) {
  const up = rl();
  const right = rl();
  const down = rl();
  const left = rl();

  const positions = [];
  for (let i = 0; i < players; i++) {
    const [px, py] = rl().split(' ').map(Number);
    positions.push({ x: (px - 1 + width) % width, y: (py - 1 + height) % height });
  }

  console.log(game.turn(up, right, down, left, positions));
}
