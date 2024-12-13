import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import axios from 'axios';

interface MiniPuzzle {
  id: number;
  level: string;
  validatorScore: number;
  submitted: boolean;
  creationTime: number;
  rank: number;
  solvedCount: number;
  communityCreation: boolean;
}

interface Topic {
  handle: string;
  category: string;
  value: string;
  children: Topic[];
}
interface Puzzle {
  id: number;
  level: string;
  rank: number;
  title: string;
  validatorScore: number;
  achievementCount: number;
  doneAchievementCount: number;
  contributor: {
    userId: number;
    pseudo: string;
    publicHandle: string;
    enable: boolean;
    avatar: number;
    cover: number;
  };
  solvedCount: number;
  attemptCount: number;
  xpPoints: number;
  feedback: { feedbackId: number; feedbacks: number[] };
  topics: Topic[];
  creationTime: number;
  type: string;
  prettyId: string;
  detailsPageUrl: string;
  replayIds: number[];
  communityCreation: boolean;
}

const levelWeight: Record<string, number> = {
  tutorial: 0,
  easy: 1,
  medium: 2,
  hard: 3,
  expert: 4,
  optim: 10,
  multi: 20,
  'codegolf-easy': 30,
  'codegolf-medium': 31,
  'codegolf-hard': 32,
  'codegolf-expert': 33,
};

const codingameHostname = 'https://www.codingame.com';
async function retrievePuzzles(): Promise<Puzzle[]> {
  const { data: miniPuzzles } = await axios.post<MiniPuzzle[]>(
    `${codingameHostname}/services/Puzzle/findAllMinimalProgress`,
    [null],
  );

  const { data: puzzles } = await axios.post<Puzzle[]>(
    `${codingameHostname}/services/Puzzle/findProgressByIds`,
    [miniPuzzles.map((miniPuzzle) => miniPuzzle.id), null, 2],
  );

  return puzzles;
}

function updateReadme(puzzles: Puzzle[]): void {
  const startTag = '<!-- TABLE:START -->\n';
  const endTag = '\n<!-- TABLE:END -->';

  const table = [
    ['ID', 'Puzzle Name', 'Difficulty', 'Solved'],
    ['---', '---', '---', '---'],
  ];

  const directories = readdirSync(join(__dirname, '..', 'src'))
    .map((directory) => readdirSync(join(__dirname, '..', 'src', directory)))
    .flat();

  const weightedPuzzle: Record<string, Puzzle[]> = {};
  puzzles.forEach((puzzle) => {
    if (!weightedPuzzle[puzzle.level]) {
      weightedPuzzle[puzzle.level] = [];
    }

    weightedPuzzle[puzzle.level].push(puzzle);
  });

  const newReadmePartialString = Object.entries(weightedPuzzle)
    .sort(([level1], [level2]) => levelWeight[level1] - levelWeight[level2])
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
        ...puzzles.map((puzzle) =>
          [
            `- [${directories.includes(puzzle.prettyId) ? 'x' : ' '}]`,
            `${puzzle.id}.`,
            directories.includes(puzzle.prettyId)
              ? `[${puzzle.title}](src/${puzzle.prettyId})`
              : puzzle.title,
            `[:link:](${codingameHostname}${puzzle.detailsPageUrl})`,
          ].join(' '),
        ),
        '',
        '</details>',
      ];

      return puzzleString.join('\n');
    })
    .join('\n');

  const readmePath = join(__dirname, '..', 'README.md');
  const readmeString = readFileSync(readmePath, 'utf8');
  const tableMatch = new RegExp(`${startTag}(.*)${endTag}`, 's').exec(readmeString);

  if (!tableMatch || !tableMatch[1]) {
    throw new Error(
      'Something strange happened while processing the readme. Is the table present?',
    );
  }

  const newReadmeString = readmeString.replace(tableMatch[1], newReadmePartialString);

  writeFileSync(readmePath, newReadmeString);
}

async function main(): Promise<void> {
  const puzzles = await retrievePuzzles();

  updateReadme(puzzles);
}

// eslint-disable-next-line promise/catch-or-return
main().then(() => console.log('Finished retrieving puzzles'));
// .catch((error) => console.error(error));
