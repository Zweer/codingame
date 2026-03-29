import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { puzzlesFilepath, readmeFilepath } from './constants';
import { CodinGame } from './libs/codingame';
import type { Puzzle } from './types';

function updateReadme(puzzles: Puzzle[]): void {
  const startTag = '<!-- TABLE:START -->\n';
  const endTag = '\n<!-- TABLE:END -->';

  const solvedSet = new Set(
    readdirSync(join(__dirname, '..', 'src')).flatMap((dir) => {
      try {
        return readdirSync(join(__dirname, '..', 'src', dir));
      } catch {
        return [];
      }
    }),
  );

  const grouped: Record<string, Puzzle[]> = {};
  for (const puzzle of puzzles) {
    if (!grouped[puzzle.level]) {
      grouped[puzzle.level] = [];
    }
    grouped[puzzle.level].push(puzzle);
  }

  const newReadmePartialString = Object.entries(grouped)
    .sort(([a], [b]) => CodinGame.LEVEL_WEIGHT[a] - CodinGame.LEVEL_WEIGHT[b])
    .map(([level, puzzles]) => {
      puzzles.sort((a, b) => a.id - b.id);
      const solved = puzzles.filter((p) => solvedSet.has(p.prettyId));
      const levelDir = CodinGame.LEVEL_DIR[level];

      return [
        '<details>',
        '',
        '<summary>',
        '',
        `### ${level} (${solved.length}/${puzzles.length})`,
        '',
        '</summary>',
        '',
        ...puzzles.map((puzzle) => {
          const isSolved = solvedSet.has(puzzle.prettyId);
          const check = isSolved ? 'x' : ' ';
          const title = isSolved
            ? `[${puzzle.title}](src/${levelDir}/${puzzle.prettyId})`
            : puzzle.title;
          return `- [${check}] ${puzzle.id}. ${title} [:link:](${CodinGame.BASE_URL}${puzzle.detailsPageUrl})`;
        }),
        '',
        '</details>',
      ].join('\n');
    })
    .join('\n');

  const readmeString = readFileSync(readmeFilepath, 'utf8');
  const tableMatch = new RegExp(`${startTag}(.*)${endTag}`, 's').exec(readmeString);

  if (!tableMatch?.[1]) {
    throw new Error('Could not find table markers in README.md');
  }

  writeFileSync(readmeFilepath, readmeString.replace(tableMatch[1], newReadmePartialString));
}

const puzzles: Puzzle[] = JSON.parse(readFileSync(puzzlesFilepath, 'utf8')) as Puzzle[];
updateReadme(puzzles);
console.log('Finished updating readme');
