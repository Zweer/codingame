import { readFileSync } from 'node:fs';
import process from 'node:process';

import { dataFolder } from './constants.js';
import { CodinGame } from './libs/codingame.js';
import type { Achievement, AchievementReport } from './types-achievements.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PlanAction {
  type: 'solve-puzzle' | 'solve-specific' | 'review' | 'other';
  description: string;
  language?: string;
  puzzleLevel?: string;
  puzzlePrettyId?: string;
  achievementsUnlocked: string[];
  pointsGained: number;
  effort: 'trivial' | 'easy' | 'medium' | 'hard' | 'very-hard';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getUserId(): number {
  if (process.env.CG_USER_ID) return Number.parseInt(process.env.CG_USER_ID, 10);
  if (process.env.REMEMBER_ME) return CodinGame.userIdFromRememberMe(process.env.REMEMBER_ME);
  console.error('Set CG_USER_ID or REMEMBER_ME in .env');
  process.exit(1);
}

function remaining(a: Achievement): number {
  return a.progressMax - a.progress;
}

/** Map from coder- group suffix to canonical language name */
function buildLangGroupMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const lang of CodinGame.ALL_LANGUAGES) {
    // groupId uses lowercase, no dots: "VB.NET" -> "vbnet", "C#" -> "c#", "F#" -> "f#"
    const suffix = lang.toLowerCase().replace(/\./g, '');
    map.set(suffix, lang);
  }
  return map;
}

function langGroupSuffix(lang: string): string {
  return lang.toLowerCase().replace(/\./g, '');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const userId = getUserId();
  const report: AchievementReport = JSON.parse(readFileSync(`${dataFolder}/achievements.json`, 'utf8'));
  const cg = new CodinGame(userId);
  const langStats = await cg.countSolvedPuzzlesByProgrammingLanguage(userId);

  const all = report.achievements;
  const pendingAchs = all.filter((a) => a.progress < a.progressMax);

  // Build language map (normalized names)
  const langMap = new Map<string, number>();
  for (const l of langStats) langMap.set(l.programmingLanguageId, l.puzzleCount);

  // Track which achievement IDs are already planned
  const planned = new Set<string>();

  function findPending(groupId: string, level?: string): Achievement | undefined {
    return pendingAchs.find((a) => a.groupId === groupId && (!level || a.level === level) && !planned.has(a.id));
  }

  function markPlanned(...ids: string[]): void {
    for (const id of ids) planned.add(id);
  }

  // =========================================================================
  // PHASE 1: Quick wins
  // =========================================================================
  const phase1: PlanAction[] = [];

  // JS Addict: 14/15
  const jsAddict = findPending('coder-javascript', 'PLATINUM');
  if (jsAddict && remaining(jsAddict) <= 2) {
    phase1.push({
      type: 'solve-puzzle', description: `Solve ${remaining(jsAddict)} easy puzzle(s) in JavaScript → ${jsAddict.title}`,
      language: 'Javascript', puzzleLevel: 'easy', achievementsUnlocked: [jsAddict.title], pointsGained: jsAddict.points, effort: 'trivial',
    });
    markPlanned(jsAddict.id);
  }

  // Languages 1-2 away from next tier (only already-used languages)
  for (const [lang, count] of langMap) {
    const group = `coder-${langGroupSuffix(lang)}`;
    for (const level of ['SILVER', 'GOLD', 'PLATINUM'] as const) {
      const ach = findPending(group, level);
      if (ach && remaining(ach) <= 2) {
        phase1.push({
          type: 'solve-puzzle', description: `Solve ${remaining(ach)} puzzle(s) in ${lang} → ${ach.title}`,
          language: lang, puzzleLevel: 'easy', achievementsUnlocked: [ach.title], pointsGained: ach.points, effort: 'trivial',
        });
        markPlanned(ach.id);
        break; // only the nearest tier
      }
    }
  }

  // Reviews (6/9)
  const reviewAch = findPending('puzzle-review', 'SILVER');
  if (reviewAch && remaining(reviewAch) <= 5) {
    phase1.push({
      type: 'review', description: `Review ${remaining(reviewAch)} puzzle solution(s) → ${reviewAch.title}`,
      achievementsUnlocked: [reviewAch.title], pointsGained: reviewAch.points, effort: 'trivial',
    });
    markPlanned(reviewAch.id);
  }

  // =========================================================================
  // PHASE 2: New language explorers (BRONZE)
  // =========================================================================
  const phase2: PlanAction[] = [];
  const unusedLangs = CodinGame.ALL_LANGUAGES.filter((l) => !langMap.has(l));
  const langPriority = ['Go', 'Kotlin', 'Ruby', 'Scala', 'Swift', 'Dart', 'Haskell', 'Lua', 'Perl', 'D', 'Groovy', 'OCaml', 'F#', 'Clojure', 'Pascal', 'ObjectiveC', 'VB.NET'];
  const sortedUnused = [...unusedLangs].sort((a, b) => {
    const ai = langPriority.indexOf(a);
    const bi = langPriority.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  let langsUnlocked = langMap.size;
  const babylonAch = findPending('puzzle-language');

  for (const lang of sortedUnused) {
    const group = `coder-${langGroupSuffix(lang)}`;
    const explorerAch = findPending(group, 'BRONZE');
    if (!explorerAch) continue;

    const unlocked = [explorerAch.title];
    let pts = explorerAch.points;
    langsUnlocked++;

    if (babylonAch && langsUnlocked === 15 && !planned.has(babylonAch.id)) {
      unlocked.push(babylonAch.title);
      pts += babylonAch.points;
      markPlanned(babylonAch.id);
    }

    phase2.push({
      type: 'solve-puzzle', description: `Solve 1 easy puzzle in ${lang} → ${unlocked.join(' + ')}`,
      language: lang, puzzleLevel: 'easy', achievementsUnlocked: unlocked, pointsGained: pts, effort: 'easy',
    });
    markPlanned(explorerAch.id);
  }

  // =========================================================================
  // PHASE 3: Language regulars (3 solves each)
  // =========================================================================
  const phase3: PlanAction[] = [];

  for (const lang of CodinGame.ALL_LANGUAGES) {
    const group = `coder-${langGroupSuffix(lang)}`;
    const ach = findPending(group, 'SILVER');
    if (!ach) continue;

    const current = langMap.get(lang) ?? 0;
    // After phase 2, new langs have 1 solve
    const afterPhase2 = current > 0 ? current : (unusedLangs.includes(lang) ? 1 : 0);
    const need = ach.progressMax - afterPhase2;
    if (need <= 0) continue;

    phase3.push({
      type: 'solve-puzzle', description: `Solve ${need} more easy puzzle(s) in ${lang} → ${ach.title}`,
      language: lang, puzzleLevel: 'easy', achievementsUnlocked: [ach.title], pointsGained: ach.points, effort: 'easy',
    });
    markPlanned(ach.id);
  }

  // =========================================================================
  // PHASE 4: Specific puzzle achievements
  // =========================================================================
  const phase4: PlanAction[] = [];

  const puzzleGroupMap: Record<string, { prettyId: string; name: string; difficulty: 'medium' | 'hard' | 'very-hard' }> = {
    'puzzle-medium-mars': { prettyId: 'mars-lander-episode-2', name: 'Mars Lander Ep.2', difficulty: 'medium' },
    'puzzle-medium-skynet': { prettyId: 'death-first-search-episode-1', name: 'Death First Search Ep.1', difficulty: 'medium' },
    'puzzle-hard-apu': { prettyId: 'there-is-no-spoon-episode-2', name: 'There is no Spoon Ep.2', difficulty: 'hard' },
    'puzzle-hard-clones': { prettyId: 'don-t-panic-episode-2', name: "Don't Panic Ep.2", difficulty: 'hard' },
    'puzzle-hard-indiana': { prettyId: 'the-fall-episode-2', name: 'The Fall Ep.2', difficulty: 'hard' },
    'puzzle-hard-tan': { prettyId: 'tan-network', name: 'TAN Network', difficulty: 'hard' },
    'puzzle-hard-vox': { prettyId: 'vox-codei-episode-1', name: 'Vox Codei Ep.1', difficulty: 'hard' },
    'puzzle-hard-winamax': { prettyId: 'winamax-sponsored-contest', name: 'Winamax 2016', difficulty: 'hard' },
    'puzzle-veryhard-indiana': { prettyId: 'the-fall-episode-3', name: 'The Fall Ep.3', difficulty: 'very-hard' },
    'puzzle-veryhard-mars': { prettyId: 'mars-lander-episode-3', name: 'Mars Lander Ep.3', difficulty: 'very-hard' },
    'puzzle-veryhard-nintendo': { prettyId: 'nintendo-sponsored-contest', name: 'Nintendo', difficulty: 'very-hard' },
    'puzzle-veryhard-partitions': { prettyId: 'music-scores', name: 'Music Scores', difficulty: 'very-hard' },
    'puzzle-veryhard-triangulation': { prettyId: 'shadows-of-the-knight-episode-2', name: 'Shadows of the Knight Ep.2', difficulty: 'very-hard' },
    'puzzle-veryhard-vox': { prettyId: 'vox-codei-episode-2', name: 'Vox Codei Ep.2', difficulty: 'very-hard' },
  };

  // Clojure Roller Coaster
  const clojureRoller = findPending('puzzle-hard-roller');
  if (clojureRoller) {
    phase4.push({
      type: 'solve-specific', description: `Solve "Roller Coaster" in Clojure → ${clojureRoller.title}`,
      language: 'Clojure', puzzlePrettyId: 'roller-coaster', achievementsUnlocked: [clojureRoller.title], pointsGained: clojureRoller.points, effort: 'hard',
    });
    markPlanned(clojureRoller.id);
  }

  for (const [group, info] of Object.entries(puzzleGroupMap)) {
    const groupAchs = pendingAchs.filter((a) => a.groupId === group && !planned.has(a.id));
    if (groupAchs.length === 0) continue;

    const totalPts = groupAchs.reduce((s, a) => s + a.points, 0);
    const unlocked = groupAchs.map((a) => a.title);
    for (const a of groupAchs) markPlanned(a.id);

    phase4.push({
      type: 'solve-specific', description: `Solve "${info.name}" (${info.difficulty}) → ${unlocked.join(' + ')}`,
      puzzlePrettyId: info.prettyId, puzzleLevel: info.difficulty, achievementsUnlocked: unlocked, pointsGained: totalPts, effort: info.difficulty,
    });
  }

  // "Damn I'm good" — 3 very hard at 100%
  const damnGood = findPending('puzzle-level');
  if (damnGood) {
    phase4.push({
      type: 'other', description: `Complete 3 very-hard puzzles at 100% → ${damnGood.title} (+${damnGood.points}pts bonus)`,
      achievementsUnlocked: [damnGood.title], pointsGained: damnGood.points, effort: 'very-hard',
    });
    markPlanned(damnGood.id);
  }

  const effortOrder = { trivial: 0, easy: 1, medium: 2, hard: 3, 'very-hard': 4 };
  phase4.sort((a, b) => effortOrder[a.effort] - effortOrder[b.effort]);

  // =========================================================================
  // PHASE 5: Language lovers (7 solves)
  // =========================================================================
  const phase5: PlanAction[] = [];

  for (const lang of CodinGame.ALL_LANGUAGES) {
    const group = `coder-${langGroupSuffix(lang)}`;
    const ach = findPending(group, 'GOLD');
    if (!ach) continue;

    const current = langMap.get(lang) ?? 0;
    const afterPhase3 = Math.max(current, 3); // after phase 3, at least 3
    const need = ach.progressMax - afterPhase3;
    if (need <= 0) continue;

    phase5.push({
      type: 'solve-puzzle', description: `Solve ${need} more puzzle(s) in ${lang} → ${ach.title}`,
      language: lang, puzzleLevel: 'easy/medium', achievementsUnlocked: [ach.title], pointsGained: ach.points, effort: 'medium',
    });
    markPlanned(ach.id);
  }

  // =========================================================================
  // PHASE 6: Language addicts (15 solves)
  // =========================================================================
  const phase6: PlanAction[] = [];

  for (const lang of CodinGame.ALL_LANGUAGES) {
    const group = `coder-${langGroupSuffix(lang)}`;
    const ach = findPending(group, 'PLATINUM');
    if (!ach) continue;

    const current = langMap.get(lang) ?? 0;
    const afterPhase5 = Math.max(current, 7); // after phase 5, at least 7
    const need = ach.progressMax - afterPhase5;
    if (need <= 0) continue;

    phase6.push({
      type: 'solve-puzzle', description: `Solve ${need} more puzzle(s) in ${lang} → ${ach.title}`,
      language: lang, puzzleLevel: 'mixed', achievementsUnlocked: [ach.title], pointsGained: ach.points, effort: 'hard',
    });
    markPlanned(ach.id);
  }

  // =========================================================================
  // Remaining reviews
  // =========================================================================
  const phase7: PlanAction[] = [];
  for (const level of ['GOLD', 'PLATINUM'] as const) {
    const ach = findPending('puzzle-review', level);
    if (ach) {
      phase7.push({
        type: 'review', description: `Review ${remaining(ach)} puzzle solution(s) → ${ach.title}`,
        achievementsUnlocked: [ach.title], pointsGained: ach.points, effort: 'easy',
      });
      markPlanned(ach.id);
    }
  }

  // =========================================================================
  // Skipped
  // =========================================================================
  const skipped = pendingAchs.filter((a) => !planned.has(a.id));

  // =========================================================================
  // Output
  // =========================================================================
  const phases = [
    { name: '🎯 Phase 1: Quick Wins', actions: phase1 },
    { name: '🌍 Phase 2: Language Explorers (1 puzzle each)', actions: phase2 },
    { name: '📈 Phase 3: Language Regulars (3 solves each)', actions: phase3 },
    { name: '🧩 Phase 4: Specific Puzzle Achievements', actions: phase4 },
    { name: '💖 Phase 5: Language Lovers (7 solves each)', actions: phase5 },
    { name: '🔥 Phase 6: Language Addicts (15 solves each)', actions: phase6 },
    { name: '📝 Phase 7: Reviews', actions: phase7 },
  ].filter((p) => p.actions.length > 0);

  const totalPts = phases.reduce((s, p) => s + p.actions.reduce((s2, a) => s2 + a.pointsGained, 0), 0);
  const totalAchs = phases.reduce((s, p) => s + p.actions.reduce((s2, a) => s2 + a.achievementsUnlocked.length, 0), 0);

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║           🏆 ACHIEVEMENT CONQUEST PLAN 🏆                  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log();
  console.log(`Current: ${report.completed}/${report.total} achievements (${report.earnedPoints}/${report.totalPoints} pts)`);
  console.log(`Plan covers: ~${totalAchs} achievements, ~${totalPts} pts`);
  console.log(`Skipped: ${skipped.length} achievements (contests, social, clash, etc.)`);
  console.log();

  for (const phase of phases) {
    const pts = phase.actions.reduce((s, a) => s + a.pointsGained, 0);
    console.log(`${'─'.repeat(64)}`);
    console.log(`${phase.name} (+${pts} pts)`);
    console.log(`${'─'.repeat(64)}`);
    for (const action of phase.actions) {
      const emoji = { trivial: '🟢', easy: '🟡', medium: '🟠', hard: '🔴', 'very-hard': '💀' }[action.effort];
      console.log(`  ${emoji} ${action.description} (+${action.pointsGained}pts)`);
    }
    console.log();
  }

  if (skipped.length > 0) {
    console.log(`${'─'.repeat(64)}`);
    console.log(`⏭️  Skipped (${skipped.length} achievements)`);
    console.log(`${'─'.repeat(64)}`);
    for (const a of skipped.sort((x, y) => y.points - x.points)) {
      console.log(`  ⏭️  [${a.points}pts] ${a.title} — ${a.description.slice(0, 70)}`);
    }
  }

  // Estimated puzzle count
  const totalPuzzleSolves =
    phase1.filter((a) => a.type === 'solve-puzzle').reduce((s, a) => s + (Number.parseInt(a.description.match(/\d+/)?.[0] ?? '1')), 0) +
    phase2.length +
    phase3.reduce((s, a) => s + (Number.parseInt(a.description.match(/\d+/)?.[0] ?? '1')), 0) +
    phase4.filter((a) => a.type === 'solve-specific').length +
    phase5.reduce((s, a) => s + (Number.parseInt(a.description.match(/\d+/)?.[0] ?? '1')), 0) +
    phase6.reduce((s, a) => s + (Number.parseInt(a.description.match(/\d+/)?.[0] ?? '1')), 0);

  console.log();
  console.log(`${'═'.repeat(64)}`);
  console.log(`📊 ESTIMATED TOTAL: ~${totalPuzzleSolves} puzzle submissions across all phases`);
  console.log(`${'═'.repeat(64)}`);
}

void main();
