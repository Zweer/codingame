/**
 * Run all test cases for an optimization puzzle and show scores.
 * Usage: npx tsx scripts/test-optim.ts <puzzle-id> <source-file> [language]
 */
import { readFileSync } from 'node:fs';
import process from 'node:process';

import { CodinGame } from './libs/codingame.js';

const EXT_TO_LANG: Record<string, string> = {
  '.ts': 'TypeScript',
  '.js': 'Javascript',
  '.py': 'Python3',
  '.rs': 'Rust',
};

function getClient(): CodinGame {
  const rm = process.env.REMEMBER_ME;
  if (!rm) {
    console.error('Set REMEMBER_ME in .env');
    process.exit(1);
  }
  const userId = CodinGame.userIdFromRememberMe(rm);
  const cg = new CodinGame(userId);
  cg.setRememberMe(rm);
  return cg;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: npx tsx scripts/test-optim.ts <puzzle-id> <source-file> [language]');
    process.exit(1);
  }

  const [puzzleId, sourceFile] = args;
  const ext = sourceFile.slice(sourceFile.lastIndexOf('.'));
  const language = args[2] ?? EXT_TO_LANG[ext] ?? 'TypeScript';
  const code = readFileSync(sourceFile, 'utf8');

  console.log(`Puzzle: ${puzzleId} | Language: ${language} | Code: ${code.length} chars\n`);

  const cg = getClient();
  const handle = await cg.createTestSession(puzzleId);

  const scores: number[] = [];

  for (let testIndex = 1; testIndex <= 10; testIndex++) {
    try {
      const result = await cg.play(handle, code, language, testIndex);

      // Use scores array if available
      const score = result.scores?.[0] ?? -1;

      // Check for errors in frames
      let error = '';
      for (const frame of result.frames) {
        const f = frame as Record<string, string>;
        if (f.gameInformation?.includes('Timeout')) error = 'Timeout';
        if (f.gameInformation?.includes('Error')) error = f.gameInformation.slice(0, 80);
      }

      scores.push(score);
      const status = error ? `❌ score=${score} (${error})` : `✅ score=${score}`;
      console.log(`Test ${testIndex.toString().padStart(2)}: ${status}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      scores.push(0);
      console.log(`Test ${testIndex.toString().padStart(2)}: ❌ API error: ${msg.slice(0, 80)}`);
    }

    await sleep(500);
  }

  const valid = scores.filter((s) => s > 0);
  const total = valid.reduce((a, b) => a + b, 0);
  console.log(`\nTotal: ${total} | Avg: ${valid.length ? Math.round(total / valid.length) : 0} | Tests: ${valid.length}/10`);
}

void main();
