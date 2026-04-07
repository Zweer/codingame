/**
 * submit-puzzle.ts — Submit a solution to any CG puzzle.
 *
 * Reads the source file and submits it to CG for validation.
 * This is the equivalent of pasting code in the IDE and clicking "Submit".
 *
 * Usage:
 *   npx tsx scripts/submit-puzzle.ts <puzzle-pretty-id> <source-file> [language]
 *
 * Examples:
 *   npx tsx scripts/submit-puzzle.ts temperatures src/01-easy/temperatures/index.ts TypeScript
 *   npx tsx scripts/submit-puzzle.ts the-descent src/01-easy/the-descent/main.rs Rust
 *
 * Language is auto-detected from file extension if not specified.
 *
 * Environment:
 *   REMEMBER_ME — CG rememberMe cookie (from .env)
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

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: npx tsx scripts/submit-puzzle.ts <puzzle-id> <source-file> [language]');
    process.exit(1);
  }

  const [puzzleId, sourceFile] = args;
  const language = args[2] ?? detectLanguage(sourceFile);
  const code = readFileSync(sourceFile, 'utf8');

  console.log(`Puzzle:   ${puzzleId}`);
  console.log(`File:     ${sourceFile}`);
  console.log(`Language: ${language}`);
  console.log(`Code:     ${code.length} chars`);

  const cg = getClient();
  const handle = await cg.createTestSession(puzzleId);
  console.log(`Session:  ${handle}`);

  // Submit to all test cases
  console.log('\nRunning tests...');
  const result = await cg.play(handle, code, language);

  console.log(`Game ID:  ${result.gameId}`);
  console.log(`Replay:   https://www.codingame.com/replay/${result.gameId}`);

  // Check result
  if (result.metadata?.score !== undefined) {
    console.log(`Score:    ${result.metadata.score}`);
  }

  // Print any errors from frames
  for (const frame of result.frames) {
    const f = frame as Record<string, string>;
    if (f.stderr) console.log(`stderr: ${f.stderr.slice(0, 200)}`);
    if (f.gameInformation?.includes('Error')) console.log(`Error: ${f.gameInformation}`);
  }

  console.log('\nDone!');
}

void main();
