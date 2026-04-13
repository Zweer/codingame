/**
 * submit-golf.ts — Submit code golf solutions in the top 5 languages.
 *
 * Usage:
 *   npm run script:submit-golf -- <puzzle-pretty-id> [--delay=120] [--force]
 *   npm run script:submit-golf -- [--delay=120] [--force]
 *
 * When no puzzle is specified, auto-discovers all code golf puzzles that have
 * at least one solution file and submits the missing languages for each.
 *
 * Submission results are cached in data/golf-status.json to avoid redundant
 * API calls. Puzzles with all 5 languages at 100% are skipped entirely.
 * Use --force to ignore the cache and re-check via API.
 *
 * Target languages (top 5 by participation):
 *   Python3, Javascript, C++, Java, C#
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

import { CodinGame } from './libs/codingame.js';

// --- Local cache to avoid redundant API calls ---
const GOLF_STATUS_PATH = 'data/golf-status.json';

interface GolfStatus {
  /** Map of prettyId → list of languages with 100% score */
  puzzles: Record<string, string[]>;
}

function loadGolfStatus(): GolfStatus {
  try {
    if (existsSync(GOLF_STATUS_PATH)) {
      return JSON.parse(readFileSync(GOLF_STATUS_PATH, 'utf8'));
    }
  } catch { /* corrupted file, start fresh */ }
  return { puzzles: {} };
}

function saveGolfStatus(status: GolfStatus): void {
  writeFileSync(GOLF_STATUS_PATH, JSON.stringify(status, null, 2) + '\n');
}

function isFullyDone(status: GolfStatus, prettyId: string): boolean {
  const done = status.puzzles[prettyId] ?? [];
  return Object.values(GOLF_LANGS).every((lang) => done.includes(lang));
}

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
  const e = err as { response?: { status?: number; data?: unknown } };
  if (e.response?.status) {
    const data = e.response.data;
    const msg = typeof data === 'string' ? data : typeof data === 'object' && data !== null ? JSON.stringify(data) : '';
    return `HTTP ${e.response.status}${msg ? `: ${msg}` : ''}`;
  }
  return err instanceof Error ? err.message.split('\n')[0] : String(err);
}

function is422(err: unknown): boolean {
  return (err as { response?: { status?: number } }).response?.status === 422;
}

function isNetworkError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes('EAI_AGAIN') || msg.includes('ECONNRESET') || msg.includes('ETIMEDOUT') || msg.includes('ENOTFOUND') || msg.includes('socket hang up');
}

function isRetryable(err: unknown): boolean {
  return is422(err) || isNetworkError(err);
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

async function fetchExistingSubmissions(cg: CodinGame, prettyId: string, status: GolfStatus): Promise<{ done: Set<string>; handle: string | null }> {
  // Use cache only — findAllSubmissions requires a "started" session which we may not have.
  // The cache is updated after each successful submit, so it stays accurate.
  const cached = new Set(status.puzzles[prettyId] ?? []);

  // Create a session handle for submitting
  for (let retry = 0; retry < 8; retry++) {
    try {
      const handle = await cg.createTestSession(prettyId);
      return { done: cached, handle };
    } catch (err) {
      if (isRetryable(err)) {
        const waitSec = isNetworkError(err) ? (retry + 1) * 30 : 60 + retry * 60;
        console.log(`  ⏳ ${isNetworkError(err) ? 'Network error' : 'Rate limited'}, waiting ${waitSec}s...`);
        console.log(`     Detail: ${err instanceof Error ? err.message : JSON.stringify(err)}${(err as any)?.response?.data ? ' | Body: ' + JSON.stringify((err as any).response.data) : ''}`);
        await sleep(waitSec * 1000);
      } else {
        console.log(`  ⚠️  Could not create session: ${shortError(err)}`);
        return { done: cached, handle: null };
      }
    }
  }
  return { done: cached, handle: null };
}

async function submitOne(
  cg: CodinGame,
  prettyId: string,
  code: string,
  lang: string,
  existingHandle?: string | null,
): Promise<{ score: number } | null> {
  const handle = existingHandle || await cg.createTestSession(prettyId);
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
      } else if (isNetworkError(err)) {
        process.stdout.write('~');
        await sleep(15_000);
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
  status: GolfStatus,
  force: boolean,
): Promise<number> {
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`🎯 ${prettyId}`);

  const localFiles = getLocalSolutions(dir);
  console.log(`📦 Local: ${[...localFiles.keys()].join(', ')} (${localFiles.size}/${TOTAL_LANGS})`);
  if (localFiles.size === 0) return 0;

  // Check cache first — skip API calls if fully done
  if (!force && isFullyDone(status, prettyId)) {
    const cached = status.puzzles[prettyId] ?? [];
    const cachedGolf = cached.filter((l) => Object.values(GOLF_LANGS).includes(l));
    console.log(`✅ Already 100%: ${cachedGolf.join(', ')} (cached)`);
    console.log('🎉 All done!');
    return 0;
  }

  const { done, handle: sessionHandle } = await fetchExistingSubmissions(cg, prettyId, status);
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
        const result = await submitOne(cg, prettyId, code, lang, sessionHandle);

        if (result === null) {
          console.log(' ⏰ timeout');
          failures++;
        } else if (result.score === 100) {
          submitted++;
          console.log(` ✅ 100% (${code.length} chars)`);
          // Update cache
          status.puzzles[prettyId] = [...new Set([...(status.puzzles[prettyId] ?? []), lang])];
          saveGolfStatus(status);
        } else {
          console.log(` ❌ ${result.score}%`);
          failures++;
        }
        success = true;
        break;
      } catch (err: unknown) {
        if (isRetryable(err)) {
          const waitSec = isNetworkError(err) ? 30 * (retry + 1) : 90 * (retry + 1);
          process.stdout.write('\r\x1b[K');
          console.log(`  Detail: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
          await countdown(waitSec, `${lang} ${isNetworkError(err) ? 'network error' : 'rate limited'} (retry ${retry + 1})`);
        } else {
          console.log(` ❌ ${shortError(err)}`);
          console.log(`     Full error: ${err instanceof Error ? err.stack ?? err.message : JSON.stringify(err)}`);
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
  const force = flags.includes('--force');

  console.log('🏌️ Code Golf — Top 5 languages: Python3, Javascript, C++, Java, C#\n');

  const status = loadGolfStatus();
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
      const cached = isFullyDone(status, p.prettyId);
      console.log(` • ${p.prettyId} (${sols.size}/${TOTAL_LANGS})${cached ? ' ✅' : ''}`);
    }
  }

  console.log(`⏱️  Delay: ${delaySec}s between submissions${force ? ' (--force: ignoring cache)' : ''}`);

  let totalFailures = 0;
  for (const { prettyId, dir } of puzzles) {
    totalFailures += await submitPuzzle(cg, prettyId, dir, delaySec, status, force);
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
