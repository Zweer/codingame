/**
 * submit-all-langs.ts — Submit a puzzle solution in all 27 languages.
 *
 * Usage:
 *   npm run script:submit-all-langs -- <puzzle-pretty-id> [--delay=120]
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

import { CodinGame } from './libs/codingame.js';

const EXT_TO_LANG: Record<string, string> = {
  '.sh': 'Bash',
  '.c': 'C',
  '.cs': 'C#',
  '.cpp': 'C++',
  '.clj': 'Clojure',
  '.d': 'D',
  '.dart': 'Dart',
  '.fs': 'F#',
  '.go': 'Go',
  '.groovy': 'Groovy',
  '.hs': 'Haskell',
  '.java': 'Java',
  '.js': 'Javascript',
  '.kt': 'Kotlin',
  '.lua': 'Lua',
  '.m': 'ObjectiveC',
  '.ml': 'OCaml',
  '.pas': 'Pascal',
  '.pl': 'Perl',
  '.php': 'PHP',
  '.py': 'Python3',
  '.rb': 'Ruby',
  '.rs': 'Rust',
  '.scala': 'Scala',
  '.swift': 'Swift',
  '.ts': 'TypeScript',
  '.vb': 'VB.NET',
};

const TOTAL_LANGS = Object.keys(EXT_TO_LANG).length;

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

function findPuzzleDir(prettyId: string): string {
  const srcDir = join(__dirname, '..', 'src');
  for (const level of readdirSync(srcDir)) {
    const dir = join(srcDir, level, prettyId);
    try {
      readdirSync(dir);
      return dir;
    } catch {
      /* not here */
    }
  }
  console.error(`Puzzle directory not found for "${prettyId}"`);
  process.exit(1);
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

async function fetchExistingSubmissions(cg: CodinGame, prettyId: string): Promise<Set<string>> {
  for (let retry = 0; retry < 5; retry++) {
    try {
      const handle = await cg.createTestSession(prettyId);
      const existing = await cg.findAllSubmissions(handle);
      return new Set(existing.filter((s) => s.score === 100).map((s) => s.programmingLanguageId));
    } catch (err) {
      if (is422(err)) {
        console.log(`  ⏳ Rate limited fetching submissions, waiting ${(retry + 1) * 30}s...`);
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

async function main(): Promise<void> {
  const flags = process.argv.slice(2);
  const args = flags.filter((a) => !a.startsWith('--'));
  const delayArg = flags.find((a) => a.startsWith('--delay='));
  const delaySec = delayArg ? Number.parseInt(delayArg.split('=')[1], 10) : 120;
  const targetArg = flags.find((a) => a.startsWith('--target='));
  const target = targetArg ? Number.parseInt(targetArg.split('=')[1], 10) : 0;

  if (args.length < 1) {
    console.log(
      'Usage: npm run script:submit-all-langs -- <puzzle-pretty-id> [--delay=120] [--target=15]',
    );
    process.exit(1);
  }

  const prettyId = args[0];
  const dir = findPuzzleDir(prettyId);
  const cg = getClient();

  console.log(`\n🎯 Puzzle: ${prettyId}`);
  console.log(`📁 Dir:    ${dir}`);
  console.log(`⏱️  Delay:   ${delaySec}s between submissions\n`);

  // Discover local solution files
  const localFiles = new Map<string, string>();
  for (const [ext, lang] of Object.entries(EXT_TO_LANG)) {
    const file = join(dir, `solution${ext}`);
    try {
      readFileSync(file, 'utf8');
      localFiles.set(lang, file);
    } catch {
      /* no file */
    }
  }

  console.log(`📦 Local solutions: ${localFiles.size}/${TOTAL_LANGS}`);
  if (localFiles.size === 0) {
    console.log('No solution.* files found!');
    process.exit(1);
  }

  // Check already submitted on CG
  const done = await fetchExistingSubmissions(cg, prettyId);

  console.log(`✅ Already at 100%: ${done.size}/${TOTAL_LANGS}`);
  if (done.size > 0) {
    console.log(`   ${[...done].sort().join(', ')}`);
  }

  // Check language achievement progress — skip languages already at target
  let skipLangs = new Set<string>();
  if (target > 0) {
    console.log(`\n🎯 Target: ${target} puzzles per language`);
    try {
      const langCounts = await cg.countSolvedPuzzlesByProgrammingLanguage();
      const atTarget = langCounts.filter((l) => l.puzzleCount >= target);
      const needMore = langCounts.filter((l) => l.puzzleCount < target);
      skipLangs = new Set(atTarget.map((l) => l.programmingLanguageId));
      if (atTarget.length > 0) {
        console.log(
          `   ✅ Already at ${target}+: ${atTarget.map((l) => `${l.programmingLanguageId}(${l.puzzleCount})`).join(', ')}`,
        );
      }
      if (needMore.length > 0) {
        console.log(
          `   📤 Need more: ${needMore.map((l) => `${l.programmingLanguageId}(${l.puzzleCount})`).join(', ')}`,
        );
      }
    } catch (err) {
      console.log(`   ⚠️  Could not fetch language stats: ${shortError(err)}`);
    }
  }

  // Build queue
  const queue = [...localFiles.entries()]
    .filter(([lang]) => !done.has(lang) && !skipLangs.has(lang))
    .sort((a, b) => a[0].localeCompare(b[0]));

  const skipped = [...localFiles.entries()].filter(
    ([lang]) => !done.has(lang) && skipLangs.has(lang),
  );
  if (skipped.length > 0) {
    console.log(
      `\n⏭️  Skipping ${skipped.length} languages already at target: ${skipped.map(([l]) => l).join(', ')}`,
    );
  }

  if (queue.length === 0) {
    console.log(`\n🎉 All ${localFiles.size} languages already submitted at 100%!`);
    return;
  }

  const missing = [...Object.values(EXT_TO_LANG)].filter((lang) => !localFiles.has(lang)).sort();
  if (missing.length > 0) {
    console.log(`⚠️  No local file for: ${missing.join(', ')}`);
  }

  const eta = queue.length * delaySec;
  console.log(`\n📤 Submitting ${queue.length} languages (ETA ~${formatTime(eta)})\n`);

  let submitted = done.size;
  let failures = 0;

  for (let i = 0; i < queue.length; i++) {
    const [lang, file] = queue[i];
    const code = readFileSync(file, 'utf8');
    const status = `${submitted}/${TOTAL_LANGS}`;

    let success = false;
    for (let retry = 0; retry < 15; retry++) {
      try {
        process.stdout.write(
          `${progressBar(submitted, TOTAL_LANGS)} ${status} | ${lang.padEnd(14)}`,
        );
        const result = await submitOne(cg, prettyId, code, lang);

        if (result === null) {
          console.log(' ⏰ timeout');
          failures++;
        } else if (result.score === 100) {
          submitted++;
          console.log(' ✅ 100%');
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
          await countdown(waitSec, `${status} | ${lang} rate limited (retry ${retry + 1})`);
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

    // Countdown before next submit
    if (i < queue.length - 1) {
      const remaining = queue.length - i - 1;
      await countdown(delaySec, `${submitted}/${TOTAL_LANGS} done, ${remaining} remaining`);
    }
  }

  // Final summary
  console.log(`\n${'═'.repeat(50)}`);
  console.log(
    `🏁 ${prettyId} — ${progressBar(submitted, TOTAL_LANGS)} ${submitted}/${TOTAL_LANGS}`,
  );
  if (failures > 0) console.log(`   ⚠️  ${failures} failure(s)`);
  if (submitted === TOTAL_LANGS) console.log('   🎉 All 27 languages completed!');
}

main().catch((err) => {
  console.error(`\n💥 Fatal: ${shortError(err)}`);
  process.exit(1);
});
