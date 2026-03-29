import { readFileSync } from 'node:fs';
import process from 'node:process';

import { dataFolder } from './constants.js';
import { CodinGame } from './libs/codingame.js';
import type { AchievementReport } from './types-achievements.js';
import type { Puzzle } from './types.js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BATCH_SIZE = 4; // max parallel subagents

function getUserId(): number {
  if (process.env.CG_USER_ID) return Number.parseInt(process.env.CG_USER_ID, 10);
  if (process.env.REMEMBER_ME) return CodinGame.userIdFromRememberMe(process.env.REMEMBER_ME);
  console.error('Set CG_USER_ID or REMEMBER_ME in .env');
  process.exit(1);
}

function langGroupSuffix(lang: string): string {
  return lang.toLowerCase().replace(/\./g, '');
}

interface WorkItem {
  puzzlePrettyId: string;
  puzzleTitle: string;
  puzzleLevel: string;
  language: string;
  reason: string;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const userId = getUserId();
  const report: AchievementReport = JSON.parse(readFileSync(`${dataFolder}/achievements.json`, 'utf8'));
  const puzzles: Puzzle[] = JSON.parse(readFileSync(`${dataFolder}/puzzles.json`, 'utf8'));
  const cg = new CodinGame(userId);
  const langStats = await cg.countSolvedPuzzlesByProgrammingLanguage(userId);

  const langMap = new Map<string, number>();
  for (const l of langStats) langMap.set(l.programmingLanguageId, l.puzzleCount);

  const pendingAchs = report.achievements.filter((a) => a.progress < a.progressMax);

  // Find easy puzzles sorted by solvedCount (most popular = easiest)
  const easyPuzzles = puzzles
    .filter((p) => p.level === 'easy')
    .sort((a, b) => b.solvedCount - a.solvedCount);

  // Parse CLI args
  const phase = process.argv[2] ?? 'quick-wins';
  const batchNum = Number.parseInt(process.argv[3] ?? '1', 10);

  const workItems: WorkItem[] = [];

  switch (phase) {
    case 'quick-wins': {
      // JS Addict: 1 more puzzle in JS
      const jsAch = pendingAchs.find((a) => a.groupId === 'coder-javascript' && a.level === 'PLATINUM');
      if (jsAch && jsAch.progressMax - jsAch.progress <= 2) {
        workItems.push({
          puzzlePrettyId: easyPuzzles[0].prettyId,
          puzzleTitle: easyPuzzles[0].title,
          puzzleLevel: 'easy',
          language: 'Javascript',
          reason: `JS Addict (${jsAch.progress}/${jsAch.progressMax})`,
        });
      }

      // Languages close to next tier
      for (const [lang, count] of langMap) {
        const group = `coder-${langGroupSuffix(lang)}`;
        for (const level of ['SILVER', 'GOLD', 'PLATINUM'] as const) {
          const ach = pendingAchs.find((a) => a.groupId === group && a.level === level);
          if (ach && ach.progressMax - ach.progress <= 2) {
            const need = ach.progressMax - ach.progress;
            for (let i = 0; i < need; i++) {
              const puzzle = easyPuzzles[workItems.length % easyPuzzles.length];
              workItems.push({
                puzzlePrettyId: puzzle.prettyId,
                puzzleTitle: puzzle.title,
                puzzleLevel: 'easy',
                language: lang,
                reason: `${ach.title} (${ach.progress + i}/${ach.progressMax})`,
              });
            }
            break;
          }
        }
      }
      break;
    }

    case 'explorers': {
      // 1 easy puzzle per unused language
      const unusedLangs = CodinGame.ALL_LANGUAGES.filter((l) => !langMap.has(l));
      const langPriority = ['Go', 'Kotlin', 'Ruby', 'Scala', 'Swift', 'Dart', 'Haskell', 'Lua', 'Perl', 'D', 'Groovy', 'OCaml', 'F#', 'Clojure', 'Pascal', 'ObjectiveC', 'VB.NET'];
      const sorted = [...unusedLangs].sort((a, b) => {
        const ai = langPriority.indexOf(a);
        const bi = langPriority.indexOf(b);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });

      // Use the same easy puzzle for all languages in a batch (easier to verify)
      const puzzle = easyPuzzles[batchNum - 1] ?? easyPuzzles[0];
      for (const lang of sorted) {
        workItems.push({
          puzzlePrettyId: puzzle.prettyId,
          puzzleTitle: puzzle.title,
          puzzleLevel: 'easy',
          language: lang,
          reason: `${lang} Explorer`,
        });
      }
      break;
    }

    case 'regulars': {
      // Get to 3 solves per language
      const puzzle = easyPuzzles[batchNum] ?? easyPuzzles[0];
      for (const lang of CodinGame.ALL_LANGUAGES) {
        const count = langMap.get(lang) ?? 0;
        const afterExplorer = count > 0 ? count : 1; // assume explorer done
        if (afterExplorer >= 3) continue;
        const need = 3 - afterExplorer;
        for (let i = 0; i < need; i++) {
          const p = easyPuzzles[(batchNum * 10 + workItems.length) % easyPuzzles.length];
          workItems.push({
            puzzlePrettyId: p.prettyId,
            puzzleTitle: p.title,
            puzzleLevel: 'easy',
            language: lang,
            reason: `${lang} Regular (${afterExplorer + i + 1}/3)`,
          });
        }
      }
      break;
    }

    case 'lovers': {
      // Get to 7 solves per language
      for (const lang of CodinGame.ALL_LANGUAGES) {
        const count = langMap.get(lang) ?? 0;
        const afterRegular = Math.max(count, 3);
        if (afterRegular >= 7) continue;
        const need = 7 - afterRegular;
        for (let i = 0; i < need; i++) {
          const p = easyPuzzles[(batchNum * 20 + workItems.length) % easyPuzzles.length];
          workItems.push({
            puzzlePrettyId: p.prettyId,
            puzzleTitle: p.title,
            puzzleLevel: 'easy',
            language: lang,
            reason: `${lang} Lover (${afterRegular + i + 1}/7)`,
          });
        }
      }
      break;
    }

    case 'addicts': {
      // Get to 15 solves per language
      for (const lang of CodinGame.ALL_LANGUAGES) {
        const count = langMap.get(lang) ?? 0;
        const afterLover = Math.max(count, 7);
        if (afterLover >= 15) continue;
        const need = 15 - afterLover;
        for (let i = 0; i < need; i++) {
          const idx = (batchNum * 30 + workItems.length) % easyPuzzles.length;
          workItems.push({
            puzzlePrettyId: easyPuzzles[idx].prettyId,
            puzzleTitle: easyPuzzles[idx].title,
            puzzleLevel: 'easy',
            language: lang,
            reason: `${lang} Addict (${afterLover + i + 1}/15)`,
          });
        }
      }
      break;
    }

    default:
      console.error(`Unknown phase: ${phase}`);
      console.error('Usage: generate-batches.ts <phase> [batch-number]');
      console.error('Phases: quick-wins, explorers, regulars, lovers, addicts');
      process.exit(1);
  }

  // Split into batches of BATCH_SIZE
  const startIdx = (batchNum - 1) * BATCH_SIZE;
  const batch = workItems.slice(startIdx, startIdx + BATCH_SIZE);
  const totalBatches = Math.ceil(workItems.length / BATCH_SIZE);

  console.log(`Phase: ${phase} | Batch ${batchNum}/${totalBatches} | ${batch.length} items`);
  console.log(`Total work items in phase: ${workItems.length}`);
  console.log();

  for (let i = 0; i < batch.length; i++) {
    const item = batch[i];
    console.log(`[${i + 1}] ${item.language.padEnd(15)} → "${item.puzzleTitle}" (${item.puzzleLevel})`);
    console.log(`    Reason: ${item.reason}`);
    console.log(`    Puzzle: ${item.puzzlePrettyId}`);
  }

  console.log();
  console.log('─'.repeat(64));
  console.log('SUBAGENT QUERIES (copy-paste ready):');
  console.log('─'.repeat(64));

  for (const item of batch) {
    console.log();
    console.log(`Solve the CodinGame puzzle "${item.puzzlePrettyId}" in ${item.language}.`);
    console.log(`Puzzle: "${item.puzzleTitle}" (${item.puzzleLevel})`);
    console.log(`Save to: src/${CodinGame.LEVEL_DIR[item.puzzleLevel]}/${item.puzzlePrettyId}/`);
  }

  if (startIdx + BATCH_SIZE < workItems.length) {
    console.log();
    console.log(`\n📌 Next batch: npm run script:batches -- ${phase} ${batchNum + 1}`);
  } else {
    console.log();
    console.log('✅ This is the last batch for this phase!');
  }
}

void main();
