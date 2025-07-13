import { join } from 'node:path';

export const dataFolder = join(__dirname, '..', 'data');
export const puzzlesFilepath = join(dataFolder, 'puzzles.json');
export const readmeFilepath = join(__dirname, '..', 'README.md');
