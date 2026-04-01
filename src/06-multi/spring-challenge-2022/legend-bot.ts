/**
 * Spring Challenge 2022 — Legend-league bot
 * Transcribed from Python (3ataja's Legend bot) to TypeScript.
 *
 * === GAME RULES SUMMARY ===
 * Map: 17630 x 9000. Two bases at opposite corners (0,0 and 17630,9000).
 * Each player has 3 heroes and a base with 3 HP.
 * Monsters spawn from edges, move at 400/turn in straight lines.
 * If a monster enters 5000 range of a base, it targets that base.
 * If it reaches 300 of a base, it deals 1 damage and disappears.
 * Heroes move 800/turn, attack monsters within 800 for 2 damage.
 *
 * === SPELLS (Silver+ leagues) ===
 * Cost: 10 mana each. Mana = 1 per damage dealt to any monster.
 * WIND <x> <y>  — pushes all entities within 1280 by 2200 in direction (range: 1280)
 * SHIELD <id>    — target immune to spells for 12 turns (range: 2200)
 * CONTROL <id> <x> <y> — override target's next move (range: 2200)
 *
 * === FOG OF WAR (Gold+ leagues) ===
 * You only see entities within 2200 of your heroes or 6000 of your base.
 *
 * === STRATEGY ===
 * 1 attacker (hero id 0 or 5) patrols an arc around enemy base
 * 2 defenders (hero ids 1,3 and 2,4) each guard a zone near own base
 */

// CodinGame provides readline() as a global
const rl = readline;

/** All entity fields from the game input */
interface Entity {
  id: number;       // Unique identifier
  type: number;     // 0=monster, 1=my hero, 2=opponent hero
  x: number;        // Position X
  y: number;        // Position Y
  shieldLife: number;   // Turns remaining on SHIELD spell (0 = none)
  isControlled: number; // 1 if under CONTROL spell this turn
  health: number;   // Monster HP (-1 for heroes)
  vx: number;       // Monster velocity X (-1 for heroes)
  vy: number;       // Monster velocity Y (-1 for heroes)
  nearBase: number; // 1 if monster is targeting a base
  threatFor: number; // 0=neither, 1=my base, 2=enemy base
  action: string;   // The command this entity will execute
}

/** Euclidean distance between two points */
function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x1 - x2, y1 - y2);
}

/** Parse all entities from input, split into monsters/myHeroes/enemyHeroes */
function getEntities(entityCount: number): { monsters: Entity[]; myHeroes: Entity[]; enemyHeroes: Entity[] } {
  const monsters: Entity[] = [];
  const myHeroes: Entity[] = [];
  const enemyHeroes: Entity[] = [];

  for (let i = 0; i < entityCount; i++) {
    const parts = rl().split(' ').map(Number);
    const e: Entity = {
      id: parts[0],
      type: parts[1],
      x: parts[2],
      y: parts[3],
      shieldLife: parts[4],
      isControlled: parts[5],
      health: parts[6],
      vx: parts[7],
      vy: parts[8],
      nearBase: parts[9],
      threatFor: parts[10],
      action: 'WAIT',
    };
    if (e.type === 0) monsters.push(e);
    else if (e.type === 1) myHeroes.push(e);
    else enemyHeroes.push(e);
  }
  return { monsters, myHeroes, enemyHeroes };
}

/**
 * Rank monsters by threat level to a given base.
 * Closer monsters = higher threat. Monsters already heading to the base get 2x priority.
 * For enemy base (threatFor=2), also factor in monster HP (higher HP = more useful to push).
 */
function rankMonsters(monsters: Entity[], bx: number, by: number, threatFor: number): Entity[] {
  const ranked: { level: number; monster: Entity }[] = [];
  for (const m of monsters) {
    const d = dist(bx, by, m.x, m.y);
    let level = 1 / (d + 1);
    if (threatFor === 2) level += m.health;
    if (m.threatFor === threatFor) level *= 2;
    ranked.push({ level, monster: m });
  }
  ranked.sort((a, b) => b.level - a.level);
  return ranked.map((r) => r.monster);
}

/** Find which entity from `entities` is closest to `target`, return its id */
function closestEntityId(entities: Entity[], target: Entity): number {
  let bestId = -1;
  let bestD = Infinity;
  for (const e of entities) {
    const d = dist(e.x, e.y, target.x, target.y);
    if (d < bestD) {
      bestD = d;
      bestId = e.id;
    }
  }
  return bestId;
}

/** Get all monsters within maxDist of base, sorted by distance (closest first) */
function closestMonstersToBase(monsters: Entity[], bx: number, by: number, maxDist: number): { d: number; m: Entity }[] {
  const result: { d: number; m: Entity }[] = [];
  for (const m of monsters) {
    const d = dist(bx, by, m.x, m.y);
    if (d <= maxDist) result.push({ d, m });
  }
  result.sort((a, b) => a.d - b.d);
  return result;
}

/**
 * Get monsters near base, filtered to only those in this hero's guard zone.
 * Attacker (id 0/5) sees all monsters. Defenders only see monsters in their zone.
 * This prevents two defenders from chasing the same monster in the same area.
 */
function closestMonstersToHeroFromBase(
  monsters: Entity[],
  hero: Entity,
  bx: number,
  by: number,
  maxDist: number,
  guardsThresholds: Record<number, { min: { x: number; y: number }; max: { x: number; y: number } }>,
): { d: number; m: Entity }[] {
  const baseMons = closestMonstersToBase(monsters, bx, by, maxDist);
  const result: { d: number; m: Entity }[] = [];
  for (const bm of baseMons) {
    const d = dist(hero.x, hero.y, bm.m.x, bm.m.y);
    if (hero.id === 0 || hero.id === 5) {
      result.push({ d, m: bm.m });
    } else {
      const th = guardsThresholds[hero.id];
      if (th && bm.m.x >= th.min.x && bm.m.x <= th.max.x && bm.m.y >= th.min.y && bm.m.y <= th.max.y) {
        result.push({ d, m: bm.m });
      }
    }
  }
  result.sort((a, b) => a.d - b.d);
  return result;
}

/** Closest enemy hero to our base */
function closestEnemyToBase(enemies: Entity[], bx: number, by: number): { d: number; e: Entity } | null {
  let best: { d: number; e: Entity } | null = null;
  for (const e of enemies) {
    const d = dist(bx, by, e.x, e.y);
    if (!best || d < best.d) best = { d, e };
  }
  return best;
}

/** Closest enemy hero to one of our heroes */
function closestEnemyToHero(enemies: Entity[], hero: Entity): { e: Entity | null; d: number } {
  let best: { e: Entity | null; d: number } = { e: null, d: Infinity };
  for (const e of enemies) {
    const d = dist(hero.x, hero.y, e.x, e.y);
    if (d < best.d) best = { e, d };
  }
  return best;
}

/** Closest enemy hero to a specific monster */
function closestEnemyToMonster(enemies: Entity[], monster: Entity): { d: number; e: Entity } | null {
  let best: { d: number; e: Entity } | null = null;
  for (const e of enemies) {
    const d = dist(monster.x, monster.y, e.x, e.y);
    if (!best || d < best.d) best = { d, e };
  }
  return best;
}

/** Count unshielded monsters within WIND range (1280) of hero */
function monstersInWindRange(monsters: Entity[], hero: Entity): number {
  let count = 0;
  for (const m of monsters) {
    if (dist(hero.x, hero.y, m.x, m.y) <= 1280 && !m.shieldLife) count++;
  }
  return count;
}

/** Count monsters within SPELL range (2200) of hero */
function monstersInRange(monsters: Entity[], hero: Entity): number {
  let count = 0;
  for (const m of monsters) {
    if (dist(hero.x, hero.y, m.x, m.y) <= 2200) count++;
  }
  return count;
}

/** Count unshielded monsters within WIND range — used to decide if WIND is useful */
function unshieldedMonstersInWindRange(monsters: Entity[], hero: Entity): number {
  let count = 0;
  for (const m of monsters) {
    if (dist(hero.x, hero.y, m.x, m.y) <= 1280 && !m.shieldLife) count++;
  }
  return count;
}

// =====================================================================
// INITIALIZATION — read base position, compute enemy base, set up roles
// =====================================================================
// Hero IDs depend on which corner we start:
//   top-left (base 0,0):  heroes 0,1,2 → attacker=0, def1=1, def2=2
//   bottom-right (base 17630,9000): heroes 3,4,5 → attacker=5, def1=3, def2=4
const [baseX, baseY] = rl().split(' ').map(Number);
const enemyBaseX = 17630 - baseX;
const enemyBaseY = 9000 - baseY;
const heroesPerPlayer = Number(rl()); // Always 3
const initialPos = baseX === 0 ? 'top-left' : 'bottom-right';

/**
 * Initial destinations for each hero during the first 7 turns.
 * Attacker (0/5) goes far toward enemy side.
 * Defenders (1,3 / 2,4) go to their patrol zones near own base.
 */
const heroesStrategicPoints: Record<number, { x: number; y: number }> = {
  0: { x: 9000, y: 7000 },
  1: { x: 7000, y: 3000 },
  2: { x: 4000, y: 6500 },
  3: { x: baseX - 7000, y: baseY - 3000 },
  4: { x: baseX - 4000, y: baseY - 6500 },
  5: { x: baseX - 9000, y: baseY - 7000 },
};

/**
 * GUARD ZONES — each defender only handles monsters within their rectangle.
 * Defender 1/3 covers the "upper" zone (closer to x-axis).
 * Defender 2/4 covers the "lower" zone (closer to y-axis).
 * This prevents both defenders from chasing the same monster.
 */
const guardsThresholds: Record<number, { min: { x: number; y: number }; max: { x: number; y: number } }> = {
  1: { min: { x: 0, y: 0 }, max: { x: 9000, y: 6000 } },
  2: { min: { x: 0, y: 0 }, max: { x: 6000, y: 9000 } },
  3: { min: { x: baseX - 9000, y: baseY - 6000 }, max: { x: baseX, y: baseY } },
  4: { min: { x: baseX - 6000, y: baseY - 9000 }, max: { x: baseX, y: baseY } },
};

/**
 * ATTACKER PATROL — 24 points forming an arc around the enemy base.
 * The attacker sweeps from one side to the other, staying 1000-7000 from enemy base.
 * This maximizes the chance of finding monsters to push into the enemy base.
 * The arc goes: far side → close to base → far side (back and forth).
 */
let iAtkPt = 0;
const attackerPoints: Record<number, [number, number][]> = {
  0: [
    [enemyBaseX - 7000, enemyBaseY - 1000],
    [enemyBaseX - 6625, enemyBaseY - 1625],
    [enemyBaseX - 6250, enemyBaseY - 2250],
    [enemyBaseX - 5875, enemyBaseY - 2750],
    [enemyBaseX - 5500, enemyBaseY - 3250],
    [enemyBaseX - 5000, enemyBaseY - 4000],
    [enemyBaseX - 4500, enemyBaseY - 4750],
    [enemyBaseX - 4000, enemyBaseY - 5063],
    [enemyBaseX - 3500, enemyBaseY - 5375],
    [enemyBaseX - 3000, enemyBaseY - 5688],
    [enemyBaseX - 2500, enemyBaseY - 6000],
    [enemyBaseX - 1750, enemyBaseY - 6250],
    [enemyBaseX - 1000, enemyBaseY - 6500],
    [enemyBaseX - 1750, enemyBaseY - 6250],
    [enemyBaseX - 2500, enemyBaseY - 6000],
    [enemyBaseX - 3000, enemyBaseY - 5688],
    [enemyBaseX - 3500, enemyBaseY - 5375],
    [enemyBaseX - 4000, enemyBaseY - 5063],
    [enemyBaseX - 4500, enemyBaseY - 4750],
    [enemyBaseX - 5000, enemyBaseY - 4000],
    [enemyBaseX - 5500, enemyBaseY - 3250],
    [enemyBaseX - 5875, enemyBaseY - 2750],
    [enemyBaseX - 6250, enemyBaseY - 2250],
    [enemyBaseX - 6625, enemyBaseY - 1625],
  ],
  5: [
    [7000, 1000],
    [6625, 1625],
    [6250, 2250],
    [5875, 2750],
    [5500, 3250],
    [5000, 4000],
    [4500, 4750],
    [4000, 5063],
    [3500, 5375],
    [3000, 5688],
    [2500, 6000],
    [1750, 6250],
    [1000, 6500],
    [1750, 6250],
    [2500, 6000],
    [3000, 5688],
    [3500, 5375],
    [4000, 5063],
    [4500, 4750],
    [5000, 4000],
    [5500, 3250],
    [5875, 2750],
    [6250, 2250],
    [6625, 1625],
  ],
};

/**
 * DEFENDER 1 PATROL — 4 points in a small loop near base (upper zone).
 * Stays at ~6750-7250 from base. Close enough to WIND, far enough to intercept.
 */
let iDef1Pt = 0;
const def1Points: Record<number, [number, number][]> = {
  1: [
    [7250, 2250],
    [7000, 3000],
    [6750, 3750],
    [7000, 3000],
  ],
  3: [
    [baseX - 7250, baseY - 2250],
    [baseX - 7000, baseY - 3000],
    [baseX - 6750, baseY - 3750],
    [baseX - 7000, baseY - 3000],
  ],
};

/**
 * DEFENDER 2 PATROL — 4 points in a small loop near base (lower zone).
 * Stays at ~3750-4250 from base on the other diagonal.
 */
let iDef2Pt = 0;
const def2Points: Record<number, [number, number][]> = {
  2: [
    [4250, 5250],
    [4000, 6000],
    [3750, 6750],
    [4000, 6000],
  ],
  4: [
    [baseX - 4250, baseY - 5250],
    [baseX - 4000, baseY - 6000],
    [baseX - 3750, baseY - 6750],
    [baseX - 4000, baseY - 6000],
  ],
};

/**
 * PUSHED MONSTER TRACKING — after the attacker WINDs a monster toward enemy base,
 * it follows the predicted position to do a follow-up (SHIELD or another WIND).
 * This is key to scoring: WIND alone often isn't enough, you need WIND + SHIELD.
 */
let moveToPushed = false;
let pushedId = -1;
let pushedCoords = { x: 0, y: 0 };
let pushedVel = { vx: 0, vy: 0 };
let pushedRounds = 0;

let roundsCount = 0;

// =====================================================================
// GAME LOOP
// =====================================================================
while (true) {
  const [myHealth, myManaInit] = rl().split(' ').map(Number);
  const [enemyHealth, enemyMana] = rl().split(' ').map(Number);
  let myMana = myManaInit;
  const entityCount = Number(rl());
  const { monsters, myHeroes, enemyHeroes } = getEntities(entityCount);

  // Sort heroes so guards are processed FIRST (they pick monsters first).
  // Top-left: ids 2,1,0 → guards 2,1 then attacker 0
  // Bottom-right: ids 3,4,5 → guards 3,4 then attacker 5
  if (initialPos === 'top-left') {
    myHeroes.sort((a, b) => b.id - a.id);
  } else {
    myHeroes.sort((a, b) => a.id - b.id);
  }

  // --- First 7 rounds: just move to starting positions ---
  // Attacker heads toward enemy half, defenders go to patrol zones.
  if (roundsCount < 7) {
    for (const hero of myHeroes) {
      const sp = heroesStrategicPoints[hero.id];
      hero.action = `MOVE ${sp.x} ${sp.y}`;
    }
  } else {
    // Rank all monsters by threat to MY base (for defense) and ENEMY base (for attack)
    const monstersRanked = rankMonsters(monsters, baseX, baseY, 1);
    let enemyMonstersRanked = rankMonsters(monsters, enemyBaseX, enemyBaseY, 2);

    // Pre-compute: which of my heroes is closest to the #1 and #2 threats?
    // This helps assign the right defender to the right threat.
    let closestHeroToBiggest = -1;
    if (monstersRanked.length > 0) {
      closestHeroToBiggest = closestEntityId(myHeroes, monstersRanked[0]);
    }
    let closestHeroToSecond = -1;
    if (monstersRanked.length > 1) {
      closestHeroToSecond = closestEntityId(
        myHeroes.filter((h) => h.id !== closestHeroToBiggest),
        monstersRanked[1],
      );
    }

    // Track which monsters are already being handled by a defender
    const monstersBeingDealt: number[] = [];
    // Track which monsters were already WINDed this turn (avoid double-wind)
    const windedMonsters: number[] = [];

    for (const hero of myHeroes) {
      const isAttacker = hero.id === 0 || hero.id === 5;

      // =============================================================
      // ATTACKER LOGIC
      // =============================================================
      if (isAttacker) {
        // Update attacker patrol point
        const pts = attackerPoints[hero.id];
        const [px, py] = pts[iAtkPt % pts.length];
        heroesStrategicPoints[hero.id] = { x: px, y: py };

        // Filter enemy monsters to those in range
        // Only consider enemy-base monsters within spell range (2200) of attacker
        const atkEnemyMonsters = enemyMonstersRanked.filter((m) => dist(hero.x, hero.y, m.x, m.y) <= 2200);

        // --- FOLLOW-UP MODE: after WINDing a monster, chase its predicted position ---
        // The attacker tracks where the pushed monster should be and moves there
        // to cast SHIELD on it or WIND it again.
        if (moveToPushed) {
          let x = pushedCoords.x;
          let y = pushedCoords.y;
          x = x > hero.x ? x - 600 : x + 600;
          y = y > hero.y ? y - 600 : y + 600;
          hero.action = `MOVE ${x} ${y} mv_to`;
          const ebhd = dist(hero.x, hero.y, enemyBaseX, enemyBaseY);

          const reachedTarget =
            (initialPos === 'top-left' && hero.x >= pushedCoords.x && hero.y >= pushedCoords.y) ||
            (initialPos === 'bottom-right' && hero.x <= pushedCoords.x && hero.y <= pushedCoords.y);

          if (
            reachedTarget ||
            pushedRounds >= 4 ||
            atkEnemyMonsters.some((m) => m.id === pushedId) ||
            ebhd <= 400 + 2200
          ) {
            moveToPushed = false;
            pushedRounds = 0;
          } else {
            pushedCoords.x += pushedVel.vx;
            pushedCoords.y += pushedVel.vy;
            pushedRounds++;
          }
        } else if (atkEnemyMonsters.length > 0) {
          const monster = atkEnemyMonsters[0];
          const hmd = dist(hero.x, hero.y, monster.x, monster.y);
          const ebmd = dist(enemyBaseX, enemyBaseY, monster.x, monster.y);
          const ebhd = dist(hero.x, hero.y, enemyBaseX, enemyBaseY);
          const numWind = monstersInWindRange(monsters, hero);
          const numRange = monstersInRange(monsters, hero);
          const numUnshieldedWind = unshieldedMonstersInWindRange(monsters, hero);
          const { e: closestEnemy, d: closestEnemyDist } = closestEnemyToHero(enemyHeroes, hero);
          let closestEnemyMonsterDist = Infinity;
          let closestEnemyBaseDist = Infinity;
          if (closestEnemy) {
            closestEnemyMonsterDist = dist(closestEnemy.x, closestEnemy.y, monster.x, monster.y);
            closestEnemyBaseDist = dist(closestEnemy.x, closestEnemy.y, enemyBaseX, enemyBaseY);
          }

          // === ATTACKER SPELL PRIORITY (highest to lowest) ===
          //
          // 1. SHIELD monster → make it unstoppable if it can reach enemy base
          // 2. WIND enemy away → if enemy defender is blocking our monster
          // 3. WIND monster into base → push it closer to score
          // 4. CONTROL enemy away → send enemy defender to our base
          // 5. CONTROL monster toward base → redirect a wandering monster
          // 6. MOVE toward monster → get in range for next turn's spell
          // 7. MOVE to patrol point → keep sweeping the arc

          // SHIELD the monster if it's heading to enemy base and has enough HP
          // to survive the trip. Formula: dist <= 400*i AND hp >= 2*i
          // (monster moves 400/turn, hero does 2 damage/turn)
          let acted = false;
          if (
            !acted &&
            myMana >= 10 &&
            !monster.shieldLife &&
            !monster.isControlled &&
            monster.threatFor === 2 &&
            hmd <= 2200
          ) {
            let shouldShield = false;
            for (let i = 1; i < 16; i++) {
              if (ebmd <= 400 * i && monster.health >= 2 * i) {
                shouldShield = true;
                break;
              }
            }
            if (shouldShield) {
              hero.action = `SPELL SHIELD ${monster.id} shld`;
              myMana -= 10;
              acted = true;
            }
          }

          // WIND enemy hero away from our monster — if enemy is closer to monster
          // than we are, and there are no unshielded monsters we could wind instead.
          // This clears the path for our monster to reach the base.
          if (
            !acted &&
            myMana >= 10 &&
            closestEnemy &&
            !closestEnemy.shieldLife &&
            closestEnemyDist <= 1280 &&
            closestEnemyMonsterDist <= hmd &&
            numRange > 0 &&
            numUnshieldedWind === 0 &&
            monster.threatFor === 2 &&
            ebmd <= 6500
          ) {
            const wx = closestEnemy.x - monster.vx * 2200;
            const wy = closestEnemy.y - monster.vy * 2200;
            hero.action = `SPELL WIND ${wx} ${wy} wnd_out_enm`;
            myMana -= 10;
            acted = true;
            if (ebmd < ebhd && monster.health >= 4) {
              moveToPushed = true;
              pushedId = monster.id;
              pushedCoords = { x: monster.x + monster.vx, y: monster.y + monster.vy };
              pushedVel = { vx: monster.vx, vy: monster.vy };
            }
          }

          // WIND monster toward enemy base — the main scoring move.
          // Push any unshielded monster within 1280 range toward enemy base.
          // After pushing, enter follow-up mode to SHIELD it next turn.
          if (!acted && myMana >= 10 && !monster.shieldLife && hmd <= 1280 && ebmd <= 8000) {
            const wx = hero.x + (enemyBaseX - monster.x);
            const wy = hero.y + (enemyBaseY - monster.y);
            const newX = Math.round(monster.x + ((monster.x - enemyBaseX) * -2200) / ebmd);
            const newY = Math.round(monster.y + ((monster.y - enemyBaseY) * -2200) / ebmd);
            hero.action = `SPELL WIND ${wx} ${wy} wnd_in`;
            myMana -= 10;
            acted = true;
            moveToPushed = true;
            pushedId = monster.id;
            pushedCoords = { x: newX, y: newY };
            pushedVel = { vx: monster.vx, vy: monster.vy };
          }

          // CONTROL enemy hero — send them to OUR base (wastes their time).
          // Only if enemy is close to our monster and monster has enough HP.
          if (
            !acted &&
            myMana >= 10 &&
            closestEnemy &&
            !closestEnemy.shieldLife &&
            closestEnemyDist <= 2200 &&
            ebmd <= 6500
          ) {
            const shouldCtrl =
              (closestEnemyMonsterDist > 800 * 2 && monster.health >= 2) ||
              (closestEnemyMonsterDist <= 800 * 2 && monster.health >= 6);
            if (shouldCtrl) {
              hero.action = `SPELL CONTROL ${closestEnemy.id} ${baseX} ${baseY} ctrl_out_enm`;
              myMana -= 10;
              acted = true;
              if (ebmd < ebhd && monster.health >= 4) {
                moveToPushed = true;
                pushedId = monster.id;
                pushedCoords = { x: monster.x + monster.vx, y: monster.y + monster.vy };
                pushedVel = { vx: monster.vx, vy: monster.vy };
              }
            }
          }

          // CONTROL monster toward enemy base — redirect a wandering monster.
          // Only if no enemy nearby (or enemy is far enough that monster survives).
          // Only for monsters > 5000 from enemy base (closer ones should be WINDed).
          if (
            !acted &&
            myMana >= 10 &&
            !monster.shieldLife &&
            monster.threatFor !== 2 &&
            hmd <= 2200 &&
            ebmd > 5000
          ) {
            let shouldCtrl = false;
            if (!closestEnemy) {
              shouldCtrl = true;
            } else {
              for (let i = 2; i < 8; i++) {
                if (closestEnemyMonsterDist <= 800 * i && monster.health >= 2 * (i + 1)) {
                  if (hmd >= closestEnemyMonsterDist) {
                    shouldCtrl = true;
                    break;
                  }
                }
              }
            }
            if (shouldCtrl) {
              hero.action = `SPELL CONTROL ${monster.id} ${enemyBaseX} ${enemyBaseY} ctrl_in`;
              myMana -= 10;
              acted = true;
              if (ebmd < ebhd && monster.health >= 4) {
                moveToPushed = true;
                pushedId = monster.id;
                pushedCoords = { x: monster.x + monster.vx, y: monster.y + monster.vy };
                pushedVel = { vx: monster.vx, vy: monster.vy };
              }
            }
          }

          // MOVE toward monster — get closer for next turn's spell.
          // Offset by 850 to anticipate monster movement.
          if (!acted && ebmd <= 8000 && !monster.shieldLife) {
            let x = monster.x + monster.vx;
            let y = monster.y + monster.vy;
            x = x > hero.x ? x - 850 : x + 850;
            y = y > hero.y ? y - 850 : y + 850;
            hero.action = `MOVE ${x} ${y} flw`;
            acted = true;
          }

          // No useful action — advance to next patrol point on the arc
          if (!acted) {
            const sp = heroesStrategicPoints[hero.id];
            hero.action = `MOVE ${sp.x} ${sp.y} nxt`;
            iAtkPt++;
          }
        } else {
          // No enemy monsters — move to next patrol point
          const sp = heroesStrategicPoints[hero.id];
          hero.action = `MOVE ${sp.x} ${sp.y} nxt`;
          iAtkPt++;
        }
      } else {
        // =============================================================
        // DEFENDER LOGIC
        // =============================================================
        // Each defender patrols a small loop of 4 points and handles
        // monsters in their assigned zone. Priority:
        // 1. Handle the biggest threat (if in zone and closest hero)
        // 2. Handle the 2nd biggest threat (if in zone)
        // 3. Handle closest unhandled monster in zone
        // 4. If no monsters: follow enemy hero near base, or patrol

        // Update patrol point for this defender
        if (hero.id === 1 || hero.id === 3) {
          const pts = def1Points[hero.id];
          const [px, py] = pts[iDef1Pt % pts.length];
          heroesStrategicPoints[hero.id] = { x: px, y: py };
        } else if (hero.id === 2 || hero.id === 4) {
          const pts = def2Points[hero.id];
          const [px, py] = pts[iDef2Pt % pts.length];
          heroesStrategicPoints[hero.id] = { x: px, y: py };
        }

        if (monstersRanked.length > 0) {
          // Check if this hero should handle the biggest threat.
          // Two conditions: either this hero is the closest to it,
          // OR the monster has too much HP to kill before it reaches base.
          // Formula: hp > (dist_to_base / 400) * 2 means "can't kill in time"
          let monster: Entity | null = null;
          const m0 = monstersRanked[0];
          const th = guardsThresholds[hero.id];
          const m0InZone = th && m0.x >= th.min.x && m0.x <= th.max.x && m0.y >= th.min.y && m0.y <= th.max.y;

          if (
            (hero.id === closestHeroToBiggest ||
              m0.health > (dist(m0.x, m0.y, baseX, baseY) / 400) * 2) &&
            m0InZone
          ) {
            monster = m0;
          } else if (
            monstersRanked.length > 1 &&
            hero.id === closestHeroToSecond
          ) {
            const m1 = monstersRanked[1];
            const m1InZone = th && m1.x >= th.min.x && m1.x <= th.max.x && m1.y >= th.min.y && m1.y <= th.max.y;
            if (m1InZone) monster = m1;
          }

          if (!monster) {
            // Find closest monster not already being dealt with
            const closest = closestMonstersToHeroFromBase(monsters, hero, baseX, baseY, 8000, guardsThresholds);
            let found = false;
            for (const c of closest) {
              if (!monstersBeingDealt.includes(c.m.id)) {
                monster = c.m;
                found = true;
                break;
              }
            }
            if (!found) {
              const sp = heroesStrategicPoints[hero.id];
              hero.action = `MOVE ${sp.x} ${sp.y} nxt`;
              if (hero.id === 1 || hero.id === 3) iDef1Pt++;
              else if (hero.id === 2 || hero.id === 4) iDef2Pt++;
              continue;
            }
          }

          if (monster) {
            const hmd = dist(hero.x, hero.y, monster.x, monster.y);
            const bmd = dist(baseX, baseY, monster.x, monster.y);
            const cem = closestEnemyToMonster(enemyHeroes, monster);
            const emd = cem ? cem.d : Infinity;

            // DEFENDER SPELL: WIND monster away from base.
            // Two conditions to wind (instead of just attacking):
            // 1. Enemy hero is within wind range AND monster is very close (< 2600)
            //    → enemy might SHIELD the monster, so wind it away NOW
            // 2. Monster has too much HP to kill before it reaches base
            //    → hp > (dist_to_base / 400) * 2 means we can't out-damage it
            if (
              myMana >= 10 &&
              !monster.shieldLife &&
              hmd <= 1280 &&
              ((emd <= 1280 && bmd <= 2200 + 400) || monster.health > (bmd / 400) * 2)
            ) {
              hero.action = `SPELL WIND ${enemyBaseX} ${enemyBaseY} wnd_out`;
              windedMonsters.push(monster.id);
              myMana -= 10;
            } else {
              // Otherwise just move toward the monster to attack it
              hero.action = `MOVE ${monster.x} ${monster.y} flw`;
            }
            monstersBeingDealt.push(monster.id);
          }
        } else {
          // No monsters visible — follow enemy hero if near base, else patrol.
          // Following enemy heroes prevents them from freely pushing monsters.
          const ceb = closestEnemyToBase(enemyHeroes, baseX, baseY);
          if (ceb && ceb.d <= 6500) {
            hero.action = `MOVE ${ceb.e.x} ${ceb.e.y} flw_enm`;
          } else {
            const sp = heroesStrategicPoints[hero.id];
            hero.action = `MOVE ${sp.x} ${sp.y} nxt`;
            if (hero.id === 1 || hero.id === 3) iDef1Pt++;
            else if (hero.id === 2 || hero.id === 4) iDef2Pt++;
          }
        }
      }
    }
  }

  // Output actions sorted by hero id (CodinGame expects hero 0/3 first)
  const sorted = [...myHeroes].sort((a, b) => a.id - b.id);
  for (const hero of sorted) {
    console.log(hero.action);
  }
  roundsCount++;
}
