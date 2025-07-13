import type { Puzzle } from './types';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

import { join } from 'node:path';
import { dataFolder } from './constants';
import { CodinGame } from './libs/codingame';

const codingame = new CodinGame();

async function retrievePuzzles(): Promise<Puzzle[]> {
  const miniPuzzles = await codingame.findAllMinimalProgress();
  const puzzles = await codingame.findProgressByIds(miniPuzzles.map(miniPuzzle => miniPuzzle.id));

  return puzzles;
}

async function main(): Promise<void> {
  const puzzles = await retrievePuzzles();

  const dataFolderPath = join(__dirname, '..', dataFolder);
  if (!existsSync(dataFolderPath)) {
    mkdirSync(dataFolderPath);
  }

  writeFileSync(join(dataFolderPath, 'puzzles.json'), JSON.stringify(puzzles, null, 2));
}

void main().then(() => console.log('Finished retrieving puzzles'));
// .catch((error) => console.error(error));
