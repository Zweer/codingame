/**
 * grind-plays.ts — Spam play() calls to grind the "Tester, Ultimate Edition" achievement.
 *
 * Usage:
 *   npm run script:grind-plays -- [--target=10000] [--delay=3]
 */

import process from 'node:process';
import { CodinGame } from './libs/codingame.js';

const PUZZLE = 'the-descent'; // simplest puzzle
const CODE = 'for(;;){let m=-1,x=0;for(let i=0;i<8;i++){let h=+readline();if(h>m){m=h;x=i}}print(x)}';
const LANG = 'Javascript';

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function main(): Promise<void> {
  const flags = process.argv.slice(2);
  const targetArg = flags.find((a) => a.startsWith('--target='));
  const target = targetArg ? Number.parseInt(targetArg.split('=')[1], 10) : 10000;
  const delayArg = flags.find((a) => a.startsWith('--delay='));
  const delaySec = delayArg ? Number.parseInt(delayArg.split('=')[1], 10) : 3;

  const rm = process.env.REMEMBER_ME;
  if (!rm) { console.error('Set REMEMBER_ME in .env'); process.exit(1); }
  const userId = CodinGame.userIdFromRememberMe(rm);
  const cg = new CodinGame(userId);
  cg.setRememberMe(rm);

  // Get current count
  const achievements = await cg.findAchievements(userId);
  const tester = achievements.find((a) =>
    a.groupId === 'coder-play' && a.level === 'GOLD'
  );
  const current = tester?.progress ?? 0;
  const remaining = target - current;

  console.log(`🎮 Tester, Ultimate Edition: ${current}/${target}`);
  if (remaining <= 0) { console.log('✅ Already done!'); return; }
  console.log(`📤 Need ${remaining} more plays (delay: ${delaySec}s)\n`);

  let handle = await cg.createTestSession(PUZZLE);
  let done = 0;
  let errors = 0;
  const startTime = Date.now();
  const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  for (let i = 0; i < remaining; i++) {
    try {
      await cg.play(handle, CODE, LANG);
      done++;
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = done / elapsed;
      const etaSec = Math.round((remaining - done) / rate);
      const etaMin = Math.floor(etaSec / 60);
      const etaS = etaSec % 60;
      const pct = ((current + done) / target * 100).toFixed(1);
      const spin = spinner[done % spinner.length];
      process.stdout.write(
        `\r  ${spin} ${current + done}/${target} (${pct}%) | ${done}/${remaining} this session | ${rate.toFixed(1)}/s | ETA ${etaMin}m${String(etaS).padStart(2, '0')}s   `
      );
    } catch (err: unknown) {
      const msg = String(err);
      errors++;
      if (msg.includes('422') || msg.includes('429')) {
        process.stdout.write(`\r  ⏳ Rate limited at ${done}, waiting 60s...                    `);
        await sleep(60_000);
        handle = await cg.createTestSession(PUZZLE);
      } else if (msg.includes('EPIPE') || msg.includes('ECONNRESET')) {
        handle = await cg.createTestSession(PUZZLE);
        await sleep(5000);
      } else {
        console.error(`\n  ❌ ${msg.slice(0, 100)}`);
        if (errors > 10) { console.error('Too many errors, stopping.'); break; }
      }
    }
    await sleep(delaySec * 1000);
  }

  console.log(`\n\n🏁 Done! ${done} plays this session. Total: ~${current + done}/${target}`);
}

void main();
