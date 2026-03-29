import { readFileSync } from 'node:fs';
import process from 'node:process';

import { CodinGame } from './libs/codingame';
import type { MiniPuzzle } from './types';

interface PuzzleInfo {
  id: number;
  title: string;
  solvedCount: number;
  prettyId: string;
  level: string;
}

function getUserId(): number {
  if (process.env.CG_USER_ID) return Number.parseInt(process.env.CG_USER_ID, 10);
  if (process.env.REMEMBER_ME) return CodinGame.userIdFromRememberMe(process.env.REMEMBER_ME);
  console.error('Set CG_USER_ID or REMEMBER_ME in .env');
  process.exit(1);
}

async function main(): Promise<void> {
  const userId = getUserId();
  const cg = new CodinGame(userId);

  const mini: MiniPuzzle[] = await cg.findAllMinimalProgress();
  const optimMini = mini.filter((p) => p.level === 'optim');

  const puzzles: PuzzleInfo[] = JSON.parse(readFileSync('data/puzzles.json', 'utf8'));
  const titleMap = new Map(puzzles.map((p) => [p.id, p]));

  console.log('\n=== OPTIM PUZZLES STATUS ===\n');
  for (const p of optimMini.sort((a, b) => a.rank - b.rank)) {
    const info = titleMap.get(p.id);
    const title = info?.title ?? '???';
    const total = info?.solvedCount ?? 0;
    const pct = total > 0 ? ((p.rank / total) * 100).toFixed(1) : '?';
    const icon = p.validatorScore > 0 ? '✅' : '❌';
    console.log(
      `${icon} ${title.padEnd(35)} | Rank: ${String(p.rank).padStart(5)} / ${String(total).padStart(6)} | Top ${String(pct).padStart(5)}% | Score: ${p.validatorScore}`,
    );
  }

  const attemptedIds = new Set(optimMini.map((p) => p.id));
  const allOptim = puzzles.filter((p) => p.level === 'optim');
  const notAttempted = allOptim.filter((p) => !attemptedIds.has(p.id));
  if (notAttempted.length > 0) {
    console.log('\n--- NOT ATTEMPTED ---');
    for (const p of notAttempted) {
      console.log(`   ${p.title} (${p.solvedCount} solvers)`);
    }
  }
}

void main();
