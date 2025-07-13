import type { Puzzle } from './types';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

import { join } from 'node:path';
import { puzzlesFilepath, readmeFilepath } from './constants';
import { CodinGame } from './libs/codingame';

function updateReadme(puzzles: Puzzle[]): void {
  const startTag = '<!-- TABLE:START -->\n';
  const endTag = '\n<!-- TABLE:END -->';

  const directories = readdirSync(join(__dirname, '..', 'src'))
    .map(directory => readdirSync(join(__dirname, '..', 'src', directory)))
    .flat();

  const weightedPuzzle: Record<string, Puzzle[]> = {};
  puzzles.forEach((puzzle) => {
    // eslint-disable-next-line ts/strict-boolean-expressions
    if (!weightedPuzzle[puzzle.level]) {
      weightedPuzzle[puzzle.level] = [];
    }

    weightedPuzzle[puzzle.level].push(puzzle);
  });

  const newReadmePartialString = Object.entries(weightedPuzzle)
    .sort(([level1], [level2]) => CodinGame.LEVEL_WEIGHT[level1] - CodinGame.LEVEL_WEIGHT[level2])
    .map(([level, puzzles]) => {
      puzzles.sort((p1, p2) => p1.id - p2.id);

      const puzzleString: string[] = [
        '<details>',
        '',
        '<summary>',
        '',
        `### ${level}`,
        '',
        '</summary>',
        '',
        ...puzzles.map(puzzle =>
          [
            `- [${directories.includes(puzzle.prettyId) ? 'x' : ' '}]`,
            `${puzzle.id}.`,
            directories.includes(puzzle.prettyId)
              ? `[${puzzle.title}](src/${puzzle.prettyId})`
              : puzzle.title,
            `[:link:](${CodinGame.BASE_URL}${puzzle.detailsPageUrl})`,
          ].join(' '),
        ),
        '',
        '</details>',
      ];

      return puzzleString.join('\n');
    })
    .join('\n');

  const readmeString = readFileSync(readmeFilepath, 'utf8');
  const tableMatch = new RegExp(`${startTag}(.*)${endTag}`, 's').exec(readmeString);

  if (!tableMatch || !tableMatch[1]) {
    throw new Error(
      'Something strange happened while processing the readme. Is the table present?',
    );
  }

  const newReadmeString = readmeString.replace(tableMatch[1], newReadmePartialString);

  writeFileSync(readmeFilepath, newReadmeString);
}

function main(): void {
  const puzzles: Puzzle[] = JSON.parse(readFileSync(puzzlesFilepath, 'utf8')) as Puzzle[];
  updateReadme(puzzles);

  console.log('Finished updating readme');
}

main();
