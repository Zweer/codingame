/**
 * debug-solution.ts — Test a solution on CodinGame and show detailed output.
 * Usage: npx tsx scripts/debug-solution.ts <puzzle-id> <language> [testIndex]
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { CodinGame } from './libs/codingame.js';

const EXT_MAP: Record<string, string> = {
  Pascal: 'pas', 'F#': 'fs', D: 'd', Bash: 'sh', ObjectiveC: 'm', 'VB.NET': 'vb',
  OCaml: 'ml', Python3: 'py', Javascript: 'js', 'C++': 'cpp', Java: 'java',
  'C#': 'cs', C: 'c', Rust: 'rs', TypeScript: 'ts', PHP: 'php', Ruby: 'rb',
  Go: 'go', Kotlin: 'kt', Scala: 'scala', Swift: 'swift', Dart: 'dart',
  Haskell: 'hs', Lua: 'lua', Perl: 'pl', Clojure: 'clj', Groovy: 'groovy',
};

async function main() {
  const [puzzleId, lang, testIdx] = process.argv.slice(2);
  if (!puzzleId || !lang) { console.log('Usage: npx tsx scripts/debug-solution.ts <puzzle-id> <lang> [testIndex]'); process.exit(1); }

  const rm = process.env.REMEMBER_ME;
  if (!rm) { console.error('Set REMEMBER_ME in .env'); process.exit(1); }
  const userId = CodinGame.userIdFromRememberMe(rm);
  const cg = new CodinGame(userId);
  cg.setRememberMe(rm);

  // Find solution file
  const ext = EXT_MAP[lang];
  const dirs = ['01-easy', '02-medium', '03-hard', '04-expert'];
  let code = '';
  for (const d of dirs) {
    const p = join('src', d, puzzleId, `solution.${ext}`);
    try { code = readFileSync(p, 'utf8'); break; } catch {}
  }
  if (!code) { console.error(`No solution.${ext} found for ${puzzleId}`); process.exit(1); }

  console.log(`🧪 Testing ${puzzleId} in ${lang} (test ${testIdx ?? 1})`);
  console.log(`📝 Code: ${code.length} bytes\n`);

  const handle = await cg.createTestSession(puzzleId);
  const result = await cg.play(handle, code, lang, Number(testIdx ?? 1));

  console.log('Result keys:', Object.keys(result));
  const frames = result.frames ?? (result as any).views ?? [];
  if (!frames.length) {
    console.log('Full result:', JSON.stringify(result).slice(0, 2000));
  }
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i] as Record<string, string>;
    if (f.stderr) console.log(`[frame ${i}] STDERR:\n${f.stderr}`);
    if (f.stdout) console.log(`[frame ${i}] STDOUT:\n${f.stdout}`);
    if (f.gameInformation) console.log(`[frame ${i}] INFO: ${f.gameInformation}`);
  }
  console.log(`\n🔗 Replay: https://www.codingame.com/replay/${result.gameId}`);
}
void main();
