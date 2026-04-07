/**
 * generate-all-solutions.ts — Parse solve-log.txt and generate a single Rust file
 * that can solve any level by outputting the pre-computed solution.
 *
 * Usage:
 *   npm run script:all-solutions
 *
 * Output: src/05-optim/number-shifting/all-solutions.rs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

interface LevelSolution {
  level: number;
  password: string;
  moves: string[];
}

function parseSolveLog(logPath: string): LevelSolution[] {
  const content = readFileSync(logPath, 'utf8');
  const levels: LevelSolution[] = [];

  const blocks = content.split(/^=== Level (\d+) ===/m);
  // blocks: ['', '1', '<body1>', '3', '<body3>', ...]
  for (let i = 1; i < blocks.length; i += 2) {
    const level = Number(blocks[i]);
    const body = blocks[i + 1];
    if (!body) continue;

    const pwMatch = body.match(/^Password: (.+)$/m);
    const solIdx = body.indexOf('Solution:\n');
    const replayIdx = body.indexOf('Replay:');
    if (!pwMatch || solIdx === -1) continue;

    const solBlock = body.slice(solIdx + 'Solution:\n'.length, replayIdx === -1 ? undefined : replayIdx);
    const moves = solBlock.trim().split('\n').filter(l => /^\d+ \d+ [UDLR] [-+]$/.test(l.trim()));
    if (moves.length === 0) continue;

    levels.push({ level, password: pwMatch[1].trim(), moves: moves.map(m => m.trim()) });
  }

  return levels.sort((a, b) => a.level - b.level);
}

function generateRust(l: LevelSolution): string {
  const printlns = l.moves.map(m => `    println!("${m}");`).join('\n');

  return `use std::io;
fn main(){
    println!("${l.password}");
    let mut b=String::new();
    io::stdin().read_line(&mut b).ok();
    let h:usize=b.trim().split_whitespace().nth(1).unwrap_or("0").parse().unwrap_or(0);
    for _ in 0..h{b.clear();io::stdin().read_line(&mut b).ok();}
${printlns}
}
`;
}

function main(): void {
  const puzzleDir = join('src/05-optim/number-shifting');
  const logPath = join(puzzleDir, 'solve-log.txt');

  const levels = parseSolveLog(logPath);
  console.log(`Parsed ${levels.length} levels (${levels[0].level} - ${levels[levels.length - 1].level})`);

  const targetLevel = Number(process.argv[2]);
  if (targetLevel) {
    const level = levels.find(l => l.level === targetLevel);
    if (!level) {
      console.error(`Level ${targetLevel} not found in solve-log`);
      process.exit(1);
    }
    const outPath = join(puzzleDir, `solution-${targetLevel}.rs`);
    const rust = generateRust(level);
    writeFileSync(outPath, rust);
    console.log(`Level ${targetLevel}: ${level.moves.length} moves, written to ${outPath} (${rust.length} bytes)`);
  } else {
    // Generate one file per level
    let totalMoves = 0;
    for (const level of levels) {
      const outPath = join(puzzleDir, `solution-${level.level}.rs`);
      writeFileSync(outPath, generateRust(level));
      totalMoves += level.moves.length;
    }
    console.log(`Generated ${levels.length} files, ${totalMoves} total moves`);
  }
}

main();
