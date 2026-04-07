import { Game } from './handler.js';

// @ts-expect-error — CodinGame global
const [width, height] = readline().split(' ').map(Number);
const grid: string[] = [];
// @ts-expect-error — CodinGame global
for (let i = 0; i < height; i++) grid.push(readline());
// @ts-expect-error — CodinGame global
const side: string = readline();

const game = new Game(grid, side);
for (const line of game.solve()) console.log(line);
