import type { Puzzle } from './types';

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

import { puzzlesFilepath } from './constants';
import { CodinGame } from './libs/codingame';
import { Gemini } from './libs/gemini';

const codingame = new CodinGame();

dayjs.extend(duration);
dayjs.extend(relativeTime);

function perc(num: number): string {
  return `${Math.round(num * 100)}%`;
}

async function main(): Promise<void> {
  console.log('Starting to solve puzzles...');
  const puzzles: Puzzle[] = JSON.parse(readFileSync(puzzlesFilepath, 'utf8')) as Puzzle[];
  console.log(`Loaded ${puzzles.length} puzzles from database.`);

  const srcPath = join(__dirname, '..', 'src');
  const levelDirectories = readdirSync(srcPath);

  const solvedPuzzleIds = levelDirectories
    .map((levelDir) => {
      const levelPath = join(srcPath, levelDir);
      try {
        return readdirSync(levelPath);
      } catch (error) {
        if (error instanceof Error && 'code' in error && error.code !== 'ENOTDIR') {
          console.error(`Could not read directory ${levelPath}:`, error);
        }
        return [];
      }
    })
    .flat();

  const unsolvedPuzzles = puzzles.filter(puzzle => !solvedPuzzleIds.includes(puzzle.prettyId));

  console.log(`Found ${unsolvedPuzzles.length} unsolved puzzles (${perc(unsolvedPuzzles.length / puzzles.length)}).`);

  if (unsolvedPuzzles.length === 0) {
    return;
  }

  const gemini = new Gemini(process.env.GOOGLE_GEMINI_USE_PRO === '1');

  let puzzleNum = 0;
  for (const puzzle of unsolvedPuzzles) {
    const startRetrieveTime = dayjs();
    console.log(`\nSolving puzzle ${++puzzleNum} of ${unsolvedPuzzles.length} (${perc(puzzleNum / unsolvedPuzzles.length)}): "${puzzle.title}" (${puzzle.level})`);
    const { statement } = await codingame.findProgressByPrettyId(puzzle.prettyId);

    if (!statement) {
      console.error(`Could not find description for puzzle: ${puzzle.title}`);
      continue;
    }
    console.log(`Retrieved puzzle statement (${dayjs.duration(dayjs().diff(startRetrieveTime)).humanize()})`);

    const startSolutionTime = new Date();
    const result = await gemini.solvePuzzle(puzzle, statement);
    console.log(`Solution generated (${dayjs.duration(dayjs().diff(startSolutionTime)).humanize()})`);

    if ('error' in result) {
      console.error(`Could not extract TypeScript code from response for puzzle: ${puzzle.title}`);
      const puzzleErrorPath = join(__dirname, '..', 'src', 'errors');
      mkdirSync(puzzleErrorPath, { recursive: true });
      const errorFilePath = join(puzzleErrorPath, `${puzzle.prettyId}-error.md`);
      writeFileSync(errorFilePath, result.error);
      console.error(`Full response saved to ${errorFilePath}`);
      continue;
    }

    const { solutionCode, reasoning } = result;

    const levelDir = levelDirectories.find(dir => dir.endsWith(puzzle.level));
    if (typeof levelDir !== 'string') {
      console.error(`Could not find level directory for level: ${puzzle.level}`);
      continue;
    }

    const puzzlePath = join(srcPath, levelDir, puzzle.prettyId);
    mkdirSync(puzzlePath, { recursive: true });

    const solutionFilePath = join(puzzlePath, 'index.ts');
    writeFileSync(solutionFilePath, solutionCode);
    console.log(`Wrote solution to ${solutionFilePath}`);

    const reasoningFilePath = join(puzzlePath, 'gemini-reasoning.md');
    writeFileSync(reasoningFilePath, reasoning);
    console.log(`Wrote reasoning to ${reasoningFilePath}`);

    console.log(`Successfully solved puzzle: "${puzzle.title}"`);
  }
}

void main().then(() => console.log('\nFinished solving puzzles.'));
// .catch((error) => console.error(error));
