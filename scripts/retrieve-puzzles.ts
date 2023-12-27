import { readFileSync, writeFileSync } from 'fs';
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

async function main(): Promise<void> {
  const { data: miniPuzzles } = await axios.post<MiniPuzzle[]>(
    'https://www.codingame.com/services/Puzzle/findAllMinimalProgress',
    [null],
  );

  const { data: puzzles } = await axios.post<Puzzle[]>(
    'https://www.codingame.com/services/Puzzle/findProgressByIds',
    [miniPuzzles.map((miniPuzzle) => miniPuzzle.id), null, 1],
  );

  puzzles.sort((p1, p2) => {
    const w1 = levelWeight[p1.level];
    const w2 = levelWeight[p2.level];

    return w1 === w2 ? p1.id - p2.id : w1 - w2;
  });

  const startTag = '<!-- TABLE:START -->\n';
  const endTag = '\n<!-- TABLE:END -->';

  const table = [
    ['ID', 'Puzzle Name', 'Difficulty', 'Solved'],
    ['---', '---', '---', '---'],
  ];

  table.push(
    ...puzzles.map((puzzle) => [
      puzzle.id.toString(),
      puzzle.title.replace(/\|/g, ''),
      puzzle.level,
      '',
    ]),
  );

  const readmePath = join(__dirname, '..', 'README.md');
  const readmeString = readFileSync(readmePath, 'utf8');
  const tableMatch = new RegExp(`${startTag}(.*)${endTag}`, 's').exec(readmeString);

  if (!tableMatch || !tableMatch[1]) {
    throw new Error(
      'Something strange happened while processing the readme. Is the table present?',
    );
  }

  const newReadmeString = readmeString.replace(
    tableMatch[1],
    table.map((row) => `|${row.join('|')}|`).join('\n'),
  );

  writeFileSync(readmePath, newReadmeString);
}

// eslint-disable-next-line promise/catch-or-return
main().then(() => console.log('Finished retrieving puzzles'));
// .catch((error) => console.error(error));
