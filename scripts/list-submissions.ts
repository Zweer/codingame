import { execSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import process from 'node:process';

import { CodinGame } from './libs/codingame.js';

const LANG_EXT: Record<string, string> = {
  '.sh': 'Bash', '.c': 'C', '.cs': 'C#', '.cpp': 'C++', '.clj': 'Clojure',
  '.d': 'D', '.dart': 'Dart', '.fs': 'F#', '.go': 'Go', '.groovy': 'Groovy',
  '.hs': 'Haskell', '.java': 'Java', '.js': 'Javascript', '.kt': 'Kotlin',
  '.lua': 'Lua', '.m': 'ObjectiveC', '.ml': 'OCaml', '.pas': 'Pascal',
  '.pl': 'Perl', '.php': 'PHP', '.py': 'Python3', '.rb': 'Ruby', '.rs': 'Rust',
  '.scala': 'Scala', '.swift': 'Swift', '.ts': 'TypeScript', '.vb': 'VB.NET',
};

const rootPath = join(__dirname, '..');
const srcPath = join(rootPath, 'src');

// --since=<commit|tag> flag: only show solution files added after that commit
const sinceArg = process.argv.find((a) => a.startsWith('--since='));
let newFiles: Set<string> | undefined;
if (sinceArg) {
  const ref = sinceArg.split('=')[1];
  const diff = execSync(`git diff --name-only --diff-filter=A ${ref} HEAD -- 'src/**/solution.*'`, {
    cwd: rootPath,
    encoding: 'utf8',
  });
  newFiles = new Set(diff.trim().split('\n').filter(Boolean));
}

const items: { prettyId: string; lang: string; relPath: string }[] = [];

for (const levelDir of readdirSync(srcPath)) {
  const levelPath = join(srcPath, levelDir);
  let puzzleDirs: string[];
  try { puzzleDirs = readdirSync(levelPath); } catch { continue; }

  for (const prettyId of puzzleDirs) {
    let files: string[];
    try { files = readdirSync(join(levelPath, prettyId)); } catch { continue; }

    for (const file of files) {
      if (!file.startsWith('solution.')) continue;
      const ext = `.${file.split('.').pop()}`;
      const lang = LANG_EXT[ext];
      if (!lang) continue;

      const relPath = relative(rootPath, join(levelPath, prettyId, file));
      if (newFiles && !newFiles.has(relPath)) continue;

      items.push({ prettyId, lang, relPath });
    }
  }
}

if (items.length === 0) {
  console.log(newFiles ? 'No new solution.* files since that commit.' : 'No solution.* files found.');
  process.exit(0);
}

console.log(`📋 ${items.length} solution${items.length > 1 ? 's' : ''} to submit${newFiles ? ' (new)' : ''}\n`);

for (let i = 0; i < items.length; i++) {
  const s = items[i];
  console.log(`${String(i + 1).padStart(2)}. [${s.lang.padEnd(12)}] https://www.codingame.com/ide/puzzle/${s.prettyId}`);
  console.log(`                    ${s.relPath}`);
}
