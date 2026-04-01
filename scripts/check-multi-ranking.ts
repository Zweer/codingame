import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import axios from 'axios';

interface PuzzleInfo {
  id: number;
  title: string;
  prettyId: string;
  level: string;
  total: number;
  puzzleLeaderboardId: string;
}

interface LeaderboardUser {
  rank: number;
  pseudo: string;
  score: number;
  programmingLanguageId: string;
  league?: { name: string };
}

const PSEUDO = 'Zweer';
const api = axios.create({ baseURL: 'https://www.codingame.com' });

async function getRank(leaderboardId: string): Promise<LeaderboardUser | null> {
  try {
    const { data } = await api.post(
      '/services/LeaderboardsRemoteService/getFilteredPuzzleLeaderboard',
      [leaderboardId, null, 'global', { active: false, column: 'PSEUDO', filter: PSEUDO }],
    );
    const users: LeaderboardUser[] = data?.users ?? [];
    return users.find((u) => u.pseudo === PSEUDO) ?? null;
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const puzzles: PuzzleInfo[] = JSON.parse(readFileSync('data/puzzles.json', 'utf8'));
  const multiPuzzles = puzzles.filter((p) => p.level === 'multi');
  const titleMap = new Map(multiPuzzles.map((p) => [p.prettyId, p]));

  const localDirs = readdirSync(join(__dirname, '..', 'src', '06-multi'));

  const results: { title: string; rank: number; total: number; pct: number; league: string; lang: string; prettyId: string }[] = [];
  const notRanked: string[] = [];

  for (const dir of localDirs) {
    const info = titleMap.get(dir);
    if (!info) continue;

    const user = await getRank(info.puzzleLeaderboardId ?? info.prettyId);
    if (user) {
      const total = info.total || 1;
      results.push({
        title: info.title,
        rank: user.rank,
        total,
        pct: (user.rank / total) * 100,
        league: user.league?.name ?? '-',
        lang: user.programmingLanguageId ?? '-',
        prettyId: info.prettyId,
      });
    } else {
      notRanked.push(info.title);
    }
  }

  results.sort((a, b) => a.pct - b.pct);

  console.log(`\n=== MULTI (BOT PROGRAMMING) RANKING === (${results.length} ranked)\n`);
  for (const r of results) {
    console.log(
      `${r.title.padEnd(40)} | ${r.league.padEnd(10)} | Rank: ${String(r.rank).padStart(5)} / ${String(r.total).padStart(6)} | Top ${r.pct.toFixed(1).padStart(5)}% | ${r.lang}`,
    );
  }

  if (notRanked.length > 0) {
    console.log(`\n--- LOCAL BUT NOT RANKED (${notRanked.length}) ---`);
    for (const t of notRanked) console.log(`   ${t}`);
  }

  const localSet = new Set(localDirs);
  const notAttempted = multiPuzzles.filter((p) => !localSet.has(p.prettyId));
  if (notAttempted.length > 0) {
    console.log(`\n--- NOT ATTEMPTED (${notAttempted.length}) ---`);
    for (const p of notAttempted.sort((a, b) => b.total - a.total)) {
      console.log(`   ${p.title.padEnd(40)} (${p.total} players)`);
    }
  }
}

void main();
