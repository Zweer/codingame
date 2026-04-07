import { CodinGame } from './libs/codingame.js';

async function main(): Promise<void> {
  const gameId = process.argv[2];
  if (!gameId) { console.error('Usage: npx tsx scripts/fetch-replay.ts <gameId>'); process.exit(1); }

  const rm = process.env.REMEMBER_ME!;
  const userId = CodinGame.userIdFromRememberMe(rm);
  const cg = new CodinGame(userId);
  cg.setRememberMe(rm);

  const r = await cg.findReplayByGameId(gameId);
  console.log('Metadata:', JSON.stringify(r.metadata, null, 2));
  console.log('Frames:', r.frames.length);
  for (let i = 0; i < r.frames.length; i++) {
    const f = r.frames[i] as Record<string, string>;
    if (f.gameInformation) console.log(`frame[${i}].info:`, f.gameInformation.slice(0, 500));
    if (f.stderr) console.log(`frame[${i}].stderr:`, f.stderr.slice(0, 500));
    if (f.stdout) console.log(`frame[${i}].stdout:`, f.stdout.slice(0, 200));
  }
}
void main();
