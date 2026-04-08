/**
 * submit-puzzle.ts — Submit a solution to any CG puzzle.
 *
 * Submits code for full validation (all validators), equivalent to clicking "Submit" in the IDE.
 * Use --test-only to just run a single test case without submitting.
 *
 * Usage:
 *   npx tsx scripts/submit-puzzle.ts <puzzle-pretty-id> <source-file> [language] [--test-only]
 *
 * Examples:
 *   npx tsx scripts/submit-puzzle.ts temperatures src/01-easy/temperatures/solution.py
 *   npx tsx scripts/submit-puzzle.ts the-descent src/01-easy/the-descent/solution.rs --test-only
 */

import { readFileSync } from 'node:fs';
import process from 'node:process';

import { CodinGame } from './libs/codingame.js';

const EXT_TO_LANG: Record<string, string> = {
  '.ts': 'TypeScript',
  '.js': 'Javascript',
  '.rs': 'Rust',
  '.py': 'Python3',
  '.c': 'C',
  '.cpp': 'C++',
  '.java': 'Java',
  '.cs': 'C#',
  '.rb': 'Ruby',
  '.go': 'Go',
  '.kt': 'Kotlin',
  '.php': 'PHP',
  '.swift': 'Swift',
  '.scala': 'Scala',
  '.hs': 'Haskell',
  '.lua': 'Lua',
  '.pl': 'Perl',
  '.sh': 'Bash',
  '.d': 'D',
  '.dart': 'Dart',
  '.fs': 'F#',
  '.ml': 'OCaml',
  '.pas': 'Pascal',
  '.m': 'ObjectiveC',
  '.groovy': 'Groovy',
  '.clj': 'Clojure',
  '.vb': 'VB.NET',
};

function detectLanguage(filePath: string): string {
  const ext = filePath.slice(filePath.lastIndexOf('.'));
  const lang = EXT_TO_LANG[ext];
  if (!lang) {
    console.error(`Cannot detect language for extension "${ext}". Specify it explicitly.`);
    process.exit(1);
  }
  return lang;
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

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function main(): Promise<void> {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const testOnly = process.argv.includes('--test-only');

  if (args.length < 2) {
    console.log(
      'Usage: npx tsx scripts/submit-puzzle.ts <puzzle-id> <source-file> [language] [--test-only]',
    );
    process.exit(1);
  }

  const [puzzleId, sourceFile] = args;
  const language = args[2] ?? detectLanguage(sourceFile);
  const code = readFileSync(sourceFile, 'utf8');

  console.log(`Puzzle:   ${puzzleId}`);
  console.log(`File:     ${sourceFile}`);
  console.log(`Language: ${language}`);
  console.log(`Code:     ${code.length} chars`);
  console.log(`Mode:     ${testOnly ? 'TEST ONLY' : 'SUBMIT'}`);

  const cg = getClient();
  const handle = await cg.createTestSession(puzzleId);
  console.log(`Session:  ${handle}\n`);

  if (testOnly) {
    console.log('Running test case 1...');
    const result = await cg.play(handle, code, language);
    console.log(`Game ID:  ${result.gameId}`);
    for (const frame of result.frames) {
      const f = frame as Record<string, string>;
      if (f.stderr) console.log(`stderr: ${f.stderr.slice(0, 500)}`);
      if (f.gameInformation?.includes('Error')) console.log(`Error: ${f.gameInformation}`);
    }
    console.log('\nDone (test only).');
    return;
  }

  // Real submit
  console.log('Submitting for full validation...');
  const submissionId = await cg.submit(handle, code, language);
  console.log(`Submission ID: ${submissionId}`);

  // Poll for report
  console.log('Waiting for results...');
  for (let attempt = 0; attempt < 30; attempt++) {
    await sleep(2000);
    try {
      const report = await cg.findReportBySubmission(submissionId);
      const total = report.validators?.length ?? 0;
      const passed = report.validators?.filter((v) => v.success).length ?? 0;

      console.log(`\nScore: ${report.score}% (${passed}/${total} validators)`);
      if (report.validators) {
        for (const v of report.validators) {
          console.log(`  ${v.success ? '✅' : '❌'} ${v.name}`);
        }
      }

      if (report.score === 100) {
        console.log('\n🎉 100% — Puzzle solved!');
      } else {
        console.log(`\n⚠️  ${report.score}% — Some validators failed.`);
      }
      return;
    } catch {
      process.stdout.write('.');
    }
  }

  console.log('\nTimeout waiting for report. Check on codingame.com.');
}

void main();
