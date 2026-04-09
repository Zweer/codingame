/**
 * submit-golf.ts — Submit code golf solutions in the top 5 languages.
 *
 * Usage:
 *   npm run script:submit-golf -- <puzzle-pretty-id> [--delay=120]
 *   npm run script:submit-golf -- [--delay=120]
 *
 * When no puzzle is specified, auto-discovers all code golf puzzles that have
 * at least one solution file and submits the missing languages for each.
 *
 * Target languages (top 5 by participation):
 *   Python3, Javascript, C++, Java, C#
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

import { CodinGame } from './libs/codingame.js';

/** Top 5 code golf languages by submission count. */
const GOLF_LANGS: Record<string, string> = {
  '.py': 'Python3',
  '.js': 'Javascript',
  '.cpp': 'C++',
  '.java': 'Java',
  '.cs': 'C#',
};

const TOTAL_LANGS = Object.keys(GOLF_LANGS).length;

const GOLF_DIRS = [
  'src/07-codegolf-easy',
  'src/08-codegolf-medium',
  'src/09-codegolf-hard',
  'src/10-codegolf-expert',
];

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
}

function countdown(seconds: number, prefix: string): Promise<void> {
  return new Promise((resolve) => {
    let remaining = seconds;
    const tick = (): void => {
      if (remaining <= 0) {
        process.stdout.write('\r\x1b[K');
        resolve();
        return;
      }
      process.stdout.write(`\r\x1b[K  ⏳ ${prefix} — next submit in ${formatTime(remaining)}`);
      remaining--;
      setTimeout(tick, 1000);
    };
    tick();
  });
}

function progressBar(done: number, total: number, width = 20): string {
  const filled = Math.round((done / total) * width);
  return `[${'█'.repeat(filled)}${'░'.repeat(width - filled)}]`;
}

function shortError(err: unknown): string {
  const e = err as { response?: { status?: number; data?: { message?: string } } };
  if (e.response?.status) {
    const msg = e.response.data?.message ?? '';
    return `HTTP ${e.response.status}${msg ? `: ${msg}` : ''}`;
  }
  return err instanceof Error ? err.message.split('\n')[0] : String(err);
}

function is422(err: unknown): boolean {
  return (err as { response?: { status?: number } }).response?.status === 422;
}

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

function findPuzzleDir(prettyId: string): string {
  for (const golfDir of GOLF_DIRS) {
    const dir = join(golfDir, prettyId);
    try {
      readdirSync(dir);
      return dir;
    } catch { /* not here */ }
  }
  console.error(`Code golf puzzle directory not found for "${prettyId}"`);
  process.exit(1);
}

function getLocalSolutions(dir: string): Map<string, string> {
  const localFiles = new Map<string, string>();
  for (const [ext, lang] of Object.entries(GOLF_LANGS)) {
    const file = join(dir, `solution${ext}`);
    try {
      readFileSync(file, 'utf8');
      localFiles.set(lang, file);
    } catch { /* no file */ }
  }
  return localFiles;
}

function discoverGolfPuzzles(): Array<{ prettyId: string; dir: string }> {
  const results: Array<{ prettyId: string; dir: string }> = [];
  for (const golfDir of GOLF_DIRS) {
    try {
      for (const puzzle of readdirSync(golfDir).sort()) {
        const dir = join(golfDir, puzzle);
        const solutions = getLocalSolutions(dir);
        if (solutions.size > 0) {
          results.push({ prettyId: puzzle, dir });
        }
      }
    } catch { /* dir doesn't exist */ }
  }
  return results;
}

async function fetchExistingSubmissions(cg: CodinGame, prettyId: string): Promise<Set<string>> {
  for (let retry = 0; retry < 5; retry++) {
    try {
      const handle = await cg.createTestSession(prettyId);
      const existing = await cg.findAllSubmissions(handle);
      return new Set(existing.filter((s) => s.score === 100).map((s) => s.programmingLanguageId));
    } catch (err) {
      if (is422(err)) {
        console.log(`  ⏳ Rate limited, waiting ${(retry + 1) * 30}s...`);
        await sleep((retry + 1) * 30_000);
      } else {
        console.log(`  ⚠️  Could not fetch submissions: ${shortError(err)}`);
        return new Set();
      }
    }
  }
  return new Set();
}

async function submitOne(
  cg: CodinGame,
  prettyId: string,
  code: string,
  lang: string,
): Promise<{ score: number } | null> {
  const handle = await cg.createTestSession(prettyId);
  const subId = await cg.submit(handle, code, lang);
  process.stdout.write(` id=${subId}, waiting`);

  for (let i = 0; i < 60; i++) {
    await sleep(2000);
    try {
      const report = await cg.findReportBySubmission(subId);
      if (typeof report.score === 'number') return { score: report.score };
    } catch (err: unknown) {
      if (is422(err)) {
        process.stdout.write('!');
        await sleep(10_000);
      } else {
        process.stdout.write('.');
      }
    }
  }
  return null;
}

async function submitPuzzle(
  cg: CodinGame,
  prettyId: string,
  dir: string,
  delaySec: number,
): Promise<number> {
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`🎯 ${prettyId}`);

  const localFiles = getLocalSolutions(dir);
  console.log(`📦 Local: ${[...localFiles.keys()].join(', ')} (${localFiles.size}/${TOTAL_LANGS})`);
  if (localFiles.size === 0) return 0;

  const done = await fetchExistingSubmissions(cg, prettyId);
  const doneGolf = [...done].filter((l) => Object.values(GOLF_LANGS).includes(l));
  if (doneGolf.length > 0) console.log(`✅ Already 100%: ${doneGolf.join(', ')}`);

  const queue = [...localFiles.entries()]
    .filter(([lang]) => !done.has(lang))
    .sort((a, b) => a[0].localeCompare(b[0]));

  if (queue.length === 0) {
    console.log('🎉 All done!');
    return 0;
  }

  console.log(`📤 Submitting ${queue.length} language(s)\n`);

  let submitted = doneGolf.length;
  let failures = 0;

  for (let i = 0; i < queue.length; i++) {
    const [lang, file] = queue[i];
    const code = readFileSync(file, 'utf8');

    let success = false;
    for (let retry = 0; retry < 15; retry++) {
      try {
        process.stdout.write(
          `${progressBar(submitted, TOTAL_LANGS)} ${submitted}/${TOTAL_LANGS} | ${lang.padEnd(14)}`,
        );
        const result = await submitOne(cg, prettyId, code, lang);

        if (result === null) {
          console.log(' ⏰ timeout');
          failures++;
        } else if (result.score === 100) {
          submitted++;
          console.log(` ✅ 100% (${code.length} chars)`);
        } else {
          console.log(` ❌ ${result.score}%`);
          failures++;
        }
        success = true;
        break;
      } catch (err: unknown) {
        if (is422(err)) {
          const waitSec = 90 * (retry + 1);
          process.stdout.write('\r\x1b[K');
          await countdown(waitSec, `${lang} rate limited (retry ${retry + 1})`);
        } else {
          console.log(` ❌ ${shortError(err)}`);
          failures++;
          break;
        }
      }
    }

    if (!success) {
      console.log(`❌ ${lang} — gave up after retries`);
      failures++;
    }

    if (i < queue.length - 1) {
      await countdown(delaySec, `${submitted}/${TOTAL_LANGS} done, ${queue.length - i - 1} remaining`);
    }
  }

  console.log(`🏁 ${prettyId} — ${progressBar(submitted, TOTAL_LANGS)} ${submitted}/${TOTAL_LANGS}`);
  if (failures > 0) console.log(`   ⚠️  ${failures} failure(s)`);
  return failures;
}

async function main(): Promise<void> {
  const flags = process.argv.slice(2);
  const args = flags.filter((a) => !a.startsWith('--'));
  const delayArg = flags.find((a) => a.startsWith('--delay='));
  const delaySec = delayArg ? Number.parseInt(delayArg.split('=')[1], 10) : 120;

  console.log('🏌️ Code Golf — Top 5 languages: Python3, Javascript, C++, Java, C#\n');

  const cg = getClient();

  let puzzles: Array<{ prettyId: string; dir: string }>;
  if (args.length >= 1) {
    puzzles = [{ prettyId: args[0], dir: findPuzzleDir(args[0]) }];
  } else {
    console.log('🔍 Auto-discovering code golf puzzles with solution files...\n');
    puzzles = discoverGolfPuzzles();
    if (puzzles.length === 0) {
      console.log('No code golf puzzles found with solution files.');
      process.exit(1);
    }
    console.log(`Found ${puzzles.length} puzzles:`);
    for (const p of puzzles) {
      const sols = getLocalSolutions(p.dir);
      console.log(`   • ${p.prettyId} (${sols.size}/${TOTAL_LANGS})`);
    }
  }

  console.log(`⏱️  Delay: ${delaySec}s between submissions`);

  let totalFailures = 0;
  for (const { prettyId, dir } of puzzles) {
    totalFailures += await submitPuzzle(cg, prettyId, dir, delaySec);
  }

  if (puzzles.length > 1) {
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`🏁 Processed ${puzzles.length} puzzles`);
    if (totalFailures > 0) console.log(`   ⚠️  ${totalFailures} total failure(s)`);
    else console.log('   🎉 All submissions successful!');
  }
}

main().catch((err) => {
  console.error(`\n💥 Fatal: ${shortError(err)}`);
  process.exit(1);
});
