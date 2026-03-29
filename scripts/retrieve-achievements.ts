import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import process from 'node:process';

import { dataFolder } from './constants';
import { CodinGame } from './libs/codingame';
import type { Achievement, AchievementReport } from './types-achievements';

function getUserId(): number {
  if (process.env.CG_USER_ID) {
    return Number.parseInt(process.env.CG_USER_ID, 10);
  }
  if (process.env.REMEMBER_ME) {
    return CodinGame.userIdFromRememberMe(process.env.REMEMBER_ME);
  }
  console.error('Set CG_USER_ID or REMEMBER_ME in .env');
  process.exit(1);
}

function buildReport(achievements: Achievement[]): AchievementReport {
  const completed = achievements.filter((a) => a.progress >= a.progressMax);
  const byCategory: AchievementReport['byCategory'] = {};
  const byLevel: AchievementReport['byLevel'] = {};

  for (const a of achievements) {
    const done = a.progress >= a.progressMax;

    const cat = (byCategory[a.categoryId] ??= { completed: 0, total: 0, points: 0, earned: 0 });
    cat.total++;
    cat.points += a.points;
    if (done) {
      cat.completed++;
      cat.earned += a.points;
    }

    const lvl = (byLevel[a.level] ??= { completed: 0, total: 0 });
    lvl.total++;
    if (done) lvl.completed++;
  }

  return {
    total: achievements.length,
    completed: completed.length,
    pending: achievements.length - completed.length,
    totalPoints: achievements.reduce((s, a) => s + a.points, 0),
    earnedPoints: completed.reduce((s, a) => s + a.points, 0),
    byCategory,
    byLevel,
    achievements,
  };
}

async function main(): Promise<void> {
  const userId = getUserId();
  console.log(`Fetching achievements for userId: ${userId}`);

  const codingame = new CodinGame(userId);
  const achievements = await codingame.findAchievements(userId);

  const report = buildReport(achievements);

  if (!existsSync(dataFolder)) mkdirSync(dataFolder);

  const filepath = `${dataFolder}/achievements.json`;
  writeFileSync(filepath, JSON.stringify(report, null, 2));

  console.log(`\n=== Achievement Report ===`);
  console.log(`Total: ${report.total} | Completed: ${report.completed} | Pending: ${report.pending}`);
  console.log(`Points: ${report.earnedPoints}/${report.totalPoints}`);

  console.log(`\nBy category:`);
  for (const [cat, stats] of Object.entries(report.byCategory).sort(([, a], [, b]) => b.total - a.total)) {
    const pct = Math.round((stats.completed / stats.total) * 100);
    console.log(`  ${cat.padEnd(20)} ${stats.completed}/${stats.total} (${pct}%) — ${stats.earned}/${stats.points} pts`);
  }

  console.log(`\nBy level:`);
  for (const level of ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']) {
    const stats = report.byLevel[level];
    if (!stats) continue;
    const pct = Math.round((stats.completed / stats.total) * 100);
    console.log(`  ${level.padEnd(10)} ${stats.completed}/${stats.total} (${pct}%)`);
  }

  console.log(`\nPending achievements (sorted by points, easiest first):`);
  const pending = achievements
    .filter((a) => a.progress < a.progressMax)
    .sort((a, b) => {
      const aRatio = a.progress / a.progressMax;
      const bRatio = b.progress / b.progressMax;
      if (bRatio !== aRatio) return bRatio - aRatio;
      return a.points - b.points;
    });

  for (const a of pending.slice(0, 30)) {
    const pct = Math.round((a.progress / a.progressMax) * 100);
    console.log(`  [${a.level.padEnd(8)}] ${a.title.padEnd(40)} ${a.progress}/${a.progressMax} (${pct}%) — ${a.points}pts — ${a.categoryId}/${a.groupId}`);
  }

  if (pending.length > 30) {
    console.log(`  ... and ${pending.length - 30} more`);
  }

  console.log(`\nSaved to ${filepath}`);
}

void main();
