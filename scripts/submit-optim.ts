/**
 * submit-optim.ts — Automated solver loop for optimization puzzles.
 *
 * Usage:
 *   npm run script:submit-optim -- <puzzle-pretty-id> <solver-command>
 *
 * Example:
 *   npm run script:submit-optim -- number-shifting ./src/05-optim/number-shifting/solver_bin
 *
 * The solver can work in two modes (auto-detected):
 *
 * 1. File-based (LAHC solver): if the puzzle dir contains level.txt,
 *    the script writes the grid to level.txt, level_password.txt, number_level.txt,
 *    runs the solver, and reads solution.txt.
 *
 * 2. Stdin/stdout: the solver reads the grid from stdin and writes moves to stdout.
 *
 * State is saved in solver-state.json inside the puzzle directory.
 *
 * Environment:
 *   REMEMBER_ME — CG rememberMe cookie (from .env)
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

import { CodinGame } from './libs/codingame.js';

interface LevelState {
  password: string;
  level: number;
  grid: string;
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

function loadState(stateFile: string): LevelState {
  if (existsSync(stateFile)) {
    return JSON.parse(readFileSync(stateFile, 'utf8'));
  }
  return { password: 'first_level', level: 1, grid: '' };
}

function saveState(stateFile: string, state: LevelState): void {
  writeFileSync(stateFile, JSON.stringify(state, null, 2));
}

/**
 * Run solver via files: write level.txt + level_password.txt, execute, read solution.txt.
 * This is how the LAHC solver works.
 */
function runFileSolver(solverCmd: string, puzzleDir: string, state: LevelState): string | null {
  const levelFile = join(puzzleDir, 'level.txt');
  const passFile = join(puzzleDir, 'level_password.txt');
  const numFile = join(puzzleDir, 'number_level.txt');
  const solFile = join(puzzleDir, 'solution.txt');

  writeFileSync(levelFile, state.grid + '\n');
  writeFileSync(passFile, state.password);
  writeFileSync(numFile, String(state.level));
  try { unlinkSync(solFile); } catch {}

  try {
    execSync(solverCmd, {
      cwd: puzzleDir,
      timeout: 1_200_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch (e: unknown) {
    const err = e as { stderr?: Buffer };
    console.error(`Solver process error: ${err.stderr?.toString().slice(0, 200) ?? e}`);
  }

  if (existsSync(solFile)) {
    const sol = readFileSync(solFile, 'utf8').trim();
    if (sol) return sol;
  }
  return null;
}

/**
 * Run solver via stdin/stdout.
 */
function runStdioSolver(solverCmd: string, grid: string): string | null {
  try {
    const result = execSync(solverCmd, {
      input: grid,
      timeout: 120_000,
      maxBuffer: 10 * 1024 * 1024,
      encoding: 'utf8',
    });
    return result.trim() || null;
  } catch (e: unknown) {
    const err = e as { stderr?: string };
    console.error(`Solver failed: ${err.stderr ?? e}`);
    return null;
  }
}

function generateSubmitCode(password: string, solution: string, _h: number): { code: string; lang: string } {
  const moves = solution.split('\n').filter(l => l.trim());

  // Build a Rust array of moves, output one per game turn
  const movesArray = moves.map(m => `"${m}"`).join(',');

  const code = `use std::io;

fn read_line() -> String {
    let mut s = String::new();
    io::stdin().read_line(&mut s).unwrap();
    s
}

fn main() {
    println!("${password}");
    let dims = read_line();
    let h: usize = dims.trim().split_whitespace()
        .nth(1).unwrap().parse().unwrap();
    for _ in 0..h { read_line(); }
    ${moves.map(m => `println!("${m}");`).join('\n    ')}
}`;

  return { code, lang: 'Rust' };
}

function extractNextLevel(
  result: { frames: Array<Record<string, string>>; metadata: Record<string, unknown> },
): { password: string; level: number; grid: string } | null {
  for (let i = result.frames.length - 1; i >= 0; i--) {
    const info = result.frames[i].gameInformation;
    if (info?.includes('Code for next level')) {
      const afterColon = info.slice(info.indexOf(':') + 2);
      const lines = afterColon.split('\n');
      return {
        password: lines[0],
        level: Number(result.metadata.Level ?? 0) + 2,
        grid: lines.slice(1).join('\n').trim(),
      };
    }
  }
  return null;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: npm run script:submit-optim -- <puzzle-id> <solver-cmd>');
    console.log('');
    console.log('Examples:');
    console.log('  npm run script:submit-optim -- number-shifting "./lahc_solver_bin 4 30 3200 50000 0 2000 40000 100 40 3"');
    console.log('  npm run script:submit-optim -- number-shifting ./solver_bin');
    process.exit(1);
  }

  const [puzzleId, ...solverParts] = args;
  const solverCmd = solverParts.join(' ');
  const puzzleDir = join('src/05-optim', puzzleId);
  const stateFile = join(puzzleDir, 'solver-state.json');
  const logFile = join(puzzleDir, 'solve-log.txt');

  // Detect solver mode: if solver writes to solution.txt, use file mode
  const useFileMode = solverCmd.includes('lahc_solver');

  const cg = getClient();
  const handle = await cg.createTestSession(puzzleId);
  console.log(`Session: ${handle}`);
  console.log(`Solver: ${solverCmd} (${useFileMode ? 'file' : 'stdio'} mode)`);

  let state = loadState(stateFile);
  console.log(`Starting from level ${state.level} (${state.password.slice(0, 20)}...)`);

  // Bootstrap: fetch grid from CG if not cached
  if (!state.grid) {
    console.log('No grid cached. Fetching from CG...');
    const bootstrapCode = `use std::io;
fn main(){
    let mut buf=String::new();
    println!("${state.password}");
    io::stdin().read_line(&mut buf).ok();
    let dims=buf.trim().to_string();
    eprint!("{}\\n",dims);
    let h:usize=dims.split_whitespace().nth(1).unwrap().parse().unwrap();
    for _ in 0..h{buf.clear();io::stdin().read_line(&mut buf).ok();eprint!("{}",buf);}
}`;
    const r = await cg.play(handle, bootstrapCode, 'Rust');
    let stderr = '';
    for (const f of r.frames) {
      if ((f as Record<string, string>).stderr) stderr += (f as Record<string, string>).stderr;
    }
    if (stderr.trim()) {
      state.grid = stderr.trim();
      saveState(stateFile, state);
      console.log(`Grid: ${state.grid.split('\n')[0]}`);
    } else {
      console.error('Could not fetch grid');
      process.exit(1);
    }
  }

  let solved = 0;

  while (true) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Level ${state.level} | ${state.password.slice(0, 20)}...`);
    console.log(`Grid: ${state.grid.split('\n')[0]}`);

    // Solve (with retries)
    let solution: string | null = null;
    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 1) console.log(`Retry ${attempt}/${MAX_RETRIES}...`);
      solution = useFileMode
        ? runFileSolver(solverCmd, puzzleDir, state)
        : runStdioSolver(solverCmd, state.grid);
      if (solution) break;
      console.log(`Solver failed (attempt ${attempt}/${MAX_RETRIES})`);
    }

    if (!solution) {
      console.log('Solver failed after all retries. Stopping.');
      break;
    }
    console.log(`Solution: ${solution.split('\n').length} moves`);

    // Generate Rust code and submit
    const h = Number(state.grid.split('\n')[0].split(/\s+/)[1]);
    const { code: submitCode, lang: submitLang } = generateSubmitCode(state.password, solution, h);
    console.log('Submitting...');

    try {
      const result = await cg.play(handle, submitCode, submitLang);
      console.log(`Replay: https://www.codingame.com/replay/${result.gameId}`);

      const next = extractNextLevel(result);
      if (!next) {
        for (let i = 0; i < result.frames.length; i++) {
          const f = result.frames[i] as Record<string, string>;
          if (f.gameInformation) console.log(`  frame[${i}].info: ${f.gameInformation.slice(0, 150)}`);
        }
        console.log('No next level found. Check replay.');
        break;
      }

      solved++;
      console.log(`✓ Level ${state.level} solved! (${solved} this session)`);

      // Log
      writeFileSync(logFile, [
        `=== Level ${state.level} ===`,
        `Password: ${state.password}`,
        `Grid:`,
        state.grid,
        `Solution:`,
        solution,
        `Replay: https://www.codingame.com/replay/${result.gameId}`,
        '',
      ].join('\n'), { flag: 'a' });

      // Validate and fetch grid if incomplete
      let { grid } = next;
      if (grid) {
        const gridLines = grid.trim().split('\n');
        const expectedH = Number(gridLines[0]?.split(/\s+/)[1]);
        if (gridLines.length !== expectedH + 1) {
          console.log(`Grid incomplete: expected ${expectedH + 1} lines, got ${gridLines.length}. Re-fetching...`);
          grid = '';
        }
      }
      if (!grid) {
        console.log('Fetching grid via stderr...');
        const fetchCode = `use std::io;\nfn main(){\n    let mut buf=String::new();\n    println!("${next.password}");\n    io::stdin().read_line(&mut buf).ok();\n    let dims=buf.trim().to_string();\n    eprint!("{}\\n",dims);\n    let h:usize=dims.split_whitespace().nth(1).unwrap().parse().unwrap();\n    for _ in 0..h{buf.clear();io::stdin().read_line(&mut buf).ok();eprint!("{}",buf);}\n}`;
        const r2 = await cg.play(handle, fetchCode, 'Rust');
        let stderr = '';
        for (const f of r2.frames) {
          if ((f as Record<string, string>).stderr) stderr += (f as Record<string, string>).stderr;
        }
        grid = stderr.trim();
      }

      state = { password: next.password, level: next.level, grid };
      saveState(stateFile, state);

      await new Promise((r) => setTimeout(r, 2000));
    } catch (e) {
      console.error(`Submit error: ${e}`);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  console.log(`\nDone! Solved ${solved} levels. Current: level ${state.level}`);
}

void main();
