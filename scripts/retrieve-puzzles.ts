import type { Puzzle } from './types';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

import { dataFolder, puzzlesFilepath } from './constants';
import { CodinGame } from './libs/codingame';

const codingame = new CodinGame();

async function retrievePuzzles(): Promise<Puzzle[]> {
  const miniPuzzles = await codingame.findAllMinimalProgress();
  const puzzles = await codingame.findProgressByIds(miniPuzzles.map(miniPuzzle => miniPuzzle.id));

  return puzzles.sort((p1, p2) => p1.id - p2.id);
}

async function main(): Promise<void> {
  const puzzles = await retrievePuzzles();

  if (!existsSync(dataFolder)) {
    mkdirSync(dataFolder);
  }

  writeFileSync(puzzlesFilepath, JSON.stringify(puzzles, null, 2));
}

void main().then(() => console.log('Finished retrieving puzzles'));
// .catch((error) => console.error(error));
