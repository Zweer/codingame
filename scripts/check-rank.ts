import { readFileSync } from 'node:fs';

import { CodinGame } from './libs/codingame.js';

const userId = CodinGame.userIdFromRememberMe(process.env.REMEMBER_ME!);

async function main(): Promise<void> {
  const cg0 = new CodinGame(); // anonymous
  const cgU = new CodinGame(userId);

  const d0 = await cg0.findProgressByPrettyId('ghost-in-the-cell');
  const dU = await cgU.findProgressByPrettyId('ghost-in-the-cell');

  console.log('Anonymous - rank:', d0.rank, 'validatorScore:', d0.validatorScore);
  console.log('With user - rank:', dU.rank, 'validatorScore:', dU.validatorScore);

  // The rank in puzzles.json
  const puzzles = JSON.parse(readFileSync('data/puzzles.json', 'utf8'));
  const p = puzzles.find((pp: any) => pp.prettyId === 'ghost-in-the-cell');
  console.log('puzzles.json - rank:', p.rank);
}

main();
