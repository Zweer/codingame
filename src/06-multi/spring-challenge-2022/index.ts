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
declare function readline(): string;

enum EntityType {
  MONSTER = 'MONSTER',
  MY_HERO = 'MY_HERO',
  OPPONENT_HERO = 'OPPONENT_HERO',
}

enum ThreatForType {
  NEITHER = 'NEITHER',
  MY_BASE = 'MY_BASE',
  ENEMY_BASE = 'ENEMY_BASE',
}

enum InitialPositionType {
  TOP_LEFT = 'TOP_LEFT',
  BOTTOM_RIGHT = 'BOTTOM_RIGHT',
}

class Point {
  constructor(
    public readonly x: number,
    public readonly y: number,
  ) {}

  /** Parse all entities from input, split into monsters/myHeroes/enemyHeroes */
  dist(other: Point): number {
    return Math.hypot(this.x - other.x, this.y - other.y);
  }
}

/** All entity fields from the game input */
interface Entity {
  id: number;               // Unique identifier
  type: EntityType;         // monster, my hero, opponent hero
  coords: Point;            // Position
  shieldLife: number;       // Turns remaining on SHIELD spell (0 = none)
  isControlled: boolean;    // if under CONTROL spell this turn
  health?: number;          // Monster HP (null for heroes)
  vx?: number;              // Monster velocity X (null for heroes)
  vy?: number;              // Monster velocity Y (null for heroes)
  isNearBase: boolean;      // if monster is targeting a base
  threatFor: ThreatForType; // neither, my base, enemy base
  action: string;           // The command this entity will execute
}

class Game {
  static FIELD_WIDTH = 17630;
  static FIELD_HEIGHT = 9000;

  /**
   * Initial destinations for each hero during the first 7 turns.
   * Attacker (0/5) goes far toward enemy side.
   * Defenders (1,3 / 2,4) go to their patrol zones near own base.
   */
  static HEROES_STRATEGIC_POINTS: Record<number, Point> = {
    0: new Point(9000, 7000),
    1: new Point(7000, 3000),
    2: new Point(4000, 6500),
    3: new Point(Game.FIELD_WIDTH - 7000, Game.FIELD_HEIGHT - 3000),
    4: new Point(Game.FIELD_WIDTH - 4000, Game.FIELD_HEIGHT - 6500),
    5: new Point(Game.FIELD_WIDTH - 9000, Game.FIELD_HEIGHT - 7000),
  };

  /**
   * GUARD ZONES — each defender only handles monsters within their rectangle.
   * Defender 1/3 covers the "upper" zone (closer to x-axis).
   * Defender 2/4 covers the "lower" zone (closer to y-axis).
   * This prevents both defenders from chasing the same monster.
   */
  static GUARDS_THRESHOLDS: Record<number, { min: Point; max: Point }> = {
    1: { min: new Point(0, 0), max: new Point(9000, 6000) },
    2: { min: new Point(0, 0), max: new Point(6000, 9000) },
    3: { min: new Point(Game.FIELD_WIDTH - 9000, Game.FIELD_HEIGHT - 6000), max: new Point(Game.FIELD_WIDTH, Game.FIELD_HEIGHT) },
    4: { min: new Point(Game.FIELD_WIDTH - 6000, Game.FIELD_HEIGHT - 9000), max: new Point(Game.FIELD_WIDTH, Game.FIELD_HEIGHT) },
  };

  /**
   * ATTACKER PATROL — 24 points forming an arc around the enemy base.
   * The attacker sweeps from one side to the other, staying 1000-7000 from enemy base.
   * This maximizes the chance of finding monsters to push into the enemy base.
   * The arc goes: far side → close to base → far side (back and forth).
   */
  static ATTACKER_POINTS: Record<number, Point[]> = {
    0: [
      new Point(Game.FIELD_WIDTH - 7000, Game.FIELD_HEIGHT - 1000),
      new Point(Game.FIELD_WIDTH - 6625, Game.FIELD_HEIGHT - 1625),
      new Point(Game.FIELD_WIDTH - 6250, Game.FIELD_HEIGHT - 2250),
      new Point(Game.FIELD_WIDTH - 5875, Game.FIELD_HEIGHT - 2750),
      new Point(Game.FIELD_WIDTH - 5500, Game.FIELD_HEIGHT - 3250),
      new Point(Game.FIELD_WIDTH - 5000, Game.FIELD_HEIGHT - 4000),
      new Point(Game.FIELD_WIDTH - 4500, Game.FIELD_HEIGHT - 4750),
      new Point(Game.FIELD_WIDTH - 4000, Game.FIELD_HEIGHT - 5063),
      new Point(Game.FIELD_WIDTH - 3500, Game.FIELD_HEIGHT - 5375),
      new Point(Game.FIELD_WIDTH - 3000, Game.FIELD_HEIGHT - 5688),
      new Point(Game.FIELD_WIDTH - 2500, Game.FIELD_HEIGHT - 6000),
      new Point(Game.FIELD_WIDTH - 1750, Game.FIELD_HEIGHT - 6250),
      new Point(Game.FIELD_WIDTH - 1000, Game.FIELD_HEIGHT - 6500),
      new Point(Game.FIELD_WIDTH - 1750, Game.FIELD_HEIGHT - 6250),
      new Point(Game.FIELD_WIDTH - 2500, Game.FIELD_HEIGHT - 6000),
      new Point(Game.FIELD_WIDTH - 3000, Game.FIELD_HEIGHT - 5688),
      new Point(Game.FIELD_WIDTH - 3500, Game.FIELD_HEIGHT - 5375),
      new Point(Game.FIELD_WIDTH - 4000, Game.FIELD_HEIGHT - 5063),
      new Point(Game.FIELD_WIDTH - 4500, Game.FIELD_HEIGHT - 4750),
      new Point(Game.FIELD_WIDTH - 5000, Game.FIELD_HEIGHT - 4000),
      new Point(Game.FIELD_WIDTH - 5500, Game.FIELD_HEIGHT - 3250),
      new Point(Game.FIELD_WIDTH - 5875, Game.FIELD_HEIGHT - 2750),
      new Point(Game.FIELD_WIDTH - 6250, Game.FIELD_HEIGHT - 2250),
      new Point(Game.FIELD_WIDTH - 6625, Game.FIELD_HEIGHT - 1625),
    ],
    5: [
      new Point(7000, 1000),
      new Point(6625, 1625),
      new Point(6250, 2250),
      new Point(5875, 2750),
      new Point(5500, 3250),
      new Point(5000, 4000),
      new Point(4500, 4750),
      new Point(4000, 5063),
      new Point(3500, 5375),
      new Point(3000, 5688),
      new Point(2500, 6000),
      new Point(1750, 6250),
      new Point(1000, 6500),
      new Point(1750, 6250),
      new Point(2500, 6000),
      new Point(3000, 5688),
      new Point(3500, 5375),
      new Point(4000, 5063),
      new Point(4500, 4750),
      new Point(5000, 4000),
      new Point(5500, 3250),
      new Point(5875, 2750),
      new Point(6250, 2250),
      new Point(6625, 1625),
    ],
  };

  /**
   * DEFENDER 1 PATROL — 4 points in a small loop near base (upper zone).
   * Stays at ~6750-7250 from base. Close enough to WIND, far enough to intercept.
   */
  static DEFENDER_1_POINTS: Record<number, Point[]> = {
    1: [
      new Point(7250, 2250),
      new Point(7000, 3000),
      new Point(6750, 3750),
      new Point(7000, 3000),
    ],
    3: [
      new Point(Game.FIELD_WIDTH - 7250, Game.FIELD_HEIGHT - 2250),
      new Point(Game.FIELD_WIDTH - 7000, Game.FIELD_HEIGHT - 3000),
      new Point(Game.FIELD_WIDTH - 6750, Game.FIELD_HEIGHT - 3750),
      new Point(Game.FIELD_WIDTH - 7000, Game.FIELD_HEIGHT - 3000),
    ],
  };

  /**
   * DEFENDER 2 PATROL — 4 points in a small loop near base (lower zone).
   * Stays at ~3750-4250 from base on the other diagonal.
   */
  static DEFENDER_2_POINTS: Record<number, Point[]> = {
    2: [
      new Point(4250, 5250),
      new Point(4000, 6000),
      new Point(3750, 6750),
      new Point(4000, 6000),
    ],
    4: [
      new Point(Game.FIELD_WIDTH - 4250, Game.FIELD_HEIGHT - 5250),
      new Point(Game.FIELD_WIDTH - 4000, Game.FIELD_HEIGHT - 6000),
      new Point(Game.FIELD_WIDTH - 3750, Game.FIELD_HEIGHT - 6750),
      new Point(Game.FIELD_WIDTH - 4000, Game.FIELD_HEIGHT - 6000),
    ],
  };

  static numberToEntityType(part: number): EntityType {
    switch (part) {
      case 0:
        return EntityType.MONSTER;

      case 1:
        return EntityType.MY_HERO;

      case 2:
        return EntityType.OPPONENT_HERO;

      default:
        throw new Error(`Invalid EntityType: "${part}"`);
    }
  }

  static numberToThreatForType(part: number): ThreatForType {
    switch (part) {
      case 0:
        return ThreatForType.NEITHER;

      case 1:
        return ThreatForType.MY_BASE;

      case 2:
        return ThreatForType.ENEMY_BASE;

      default:
        throw new Error(`Invalid ThreatForType: "${part}"`);
    }
  }

  static createMoveAction(destination: Point): string {
    return `MOVE ${destination.x} ${destination.y}`;
  }

  private base: Point;
  private enemyBase: Point;
  private heroesPerPlayer: number;
  private initialPosition: InitialPositionType;

  private myHealth = 3;
  private myMana = 0;
  private enemyHealth = 3;
  private enemyMana = 0;

  private isAttackerPatrolling = false;
  private isDefender1Patrolling = false;
  private isDefender2Patrolling = false;

  private rounds = 0;

  private monsters: Entity[] = [];
  private myHeroes: Entity[] = [];
  private enemyHeroes: Entity[] = [];

  /**
   * =====================================================================
   * INITIALIZATION — read base position, compute enemy base, set up roles
   * =====================================================================
   * Hero IDs depend on which corner we start:
   *   top-left (base 0,0):  heroes 0,1,2 → attacker=0, def1=1, def2=2
   *   bottom-right (base 17630,9000): heroes 3,4,5 → attacker=5, def1=3, def2=4
   */
  constructor() {
    const [baseX, baseY] = readline().split(' ').map(Number);
    this.base = new Point(baseX, baseY);
    this.enemyBase = new Point(Game.FIELD_WIDTH - baseX, Game.FIELD_HEIGHT - baseY);
    this.heroesPerPlayer = Number(readline());
    this.initialPosition = baseX === 0 ? InitialPositionType.TOP_LEFT : InitialPositionType.BOTTOM_RIGHT;
  }

  public initTurn(): void {
    const [myHealth, myMana] = readline().split(' ').map(Number);
    this.myHealth = myHealth;
    this.myMana = myMana;

    const [enemyHealth, enemyMana] = readline().split(' ').map(Number);
    this.enemyHealth = enemyHealth;
    this.enemyMana = enemyMana;

    const entityCount = Number(readline());
    this.getEntities(entityCount);
  }

  private getEntities(entityCount: number): void {
    this.monsters = [];
    this.myHeroes = [];
    this.enemyHeroes = [];

    for (let i = 0; i < entityCount; i++) {
      const parts = readline().split(' ').map(Number);
      const entity: Entity = {
        id: parts[0],
        type: Game.numberToEntityType(parts[1]),
        coords: new Point(parts[2], parts[3]),
        shieldLife: parts[4],
        isControlled: parts[5] === 1,
        health: parts[6],
        vx: parts[7],
        vy: parts[8],
        isNearBase: parts[9] === 1,
        threatFor: Game.numberToThreatForType(parts[10]),
        action: 'WAIT',
      };

      switch (entity.type) {
        case EntityType.MONSTER:
          this.monsters.push(entity);
          break;

        case EntityType.MY_HERO:
          this.myHeroes.push(entity);
          break;

        default:
          this.enemyHeroes.push(entity);
          break;
      }
    }

    // Sort heroes so guards are processed FIRST (they pick monsters first).
    // Top-left: ids 2,1,0 → guards 2,1 then attacker 0
    // Bottom-right: ids 3,4,5 → guards 3,4 then attacker 5
    if (this.initialPosition === InitialPositionType.TOP_LEFT) {
      this.myHeroes.sort((enemyA, enemyB) => enemyB.id - enemyA.id);
    } else {
      this.myHeroes.sort((enemyA, enemyB) => enemyA.id - enemyB.id);
    }
  }

  private rankMonsters(base: Point, threatFor: ThreatForType): Entity[] {
    const ranked: { level: number; monster: Entity }[] = [];

    for (const monster of this.monsters) {
      const dist = base.dist(monster.coords);
      let level = 1 / (dist + 1);

      if (threatFor === ThreatForType.ENEMY_BASE) level += monster.health ?? 0;
      if (monster.threatFor === threatFor) level *= 2;

      ranked.push({ level, monster: monster });
    }

    ranked.sort((a, b) => b.level - a.level);
    return ranked.map((r) => r.monster);
  }

  private closestEntityId(entities: Entity[], target: Entity): number {
    let bestId = -1;
    let bestDist = Infinity;

    for (const entity of entities) {
      const dist = entity.coords.dist(target.coords);
      if (dist < bestDist) {
        bestDist = dist;
        bestId = entity.id;
      }
    }

    return bestId;
  }

  public turn(): void {
    // --- First 7 rounds: just move to starting positions ---
    // Attacker heads toward enemy half, defenders go to patrol zones.
    if (this.rounds < 7) {
      this.doSetupTurn();
    } else {
      this.doNonSetupTurn();
    }

    // Output actions sorted by hero id (CodinGame expects hero 0/3 first)
    const sortedHeroes = [...this.myHeroes].sort((a, b) => a.id - b.id);
    for (const hero of sortedHeroes) {
      console.log(hero.action);
    }

    this.rounds++;
  }

  private doSetupTurn() {
    for (const hero of this.myHeroes) {
      const strategicPoint = Game.HEROES_STRATEGIC_POINTS[hero.id];
      hero.action = Game.createMoveAction(strategicPoint);
    }
  }

  private doNonSetupTurn() {
    // Rank all monsters by threat to MY base (for defense) and ENEMY base (for attack)
    const monstersRanked = this.rankMonsters(this.base, ThreatForType.MY_BASE);
    const enemyMonstersRanked = this.rankMonsters(this.enemyBase, ThreatForType.ENEMY_BASE);

    // Pre-compute: which of my heroes is closest to the #1 and #2 threats?
    // This helps assign the right defender to the right threat.
    let closestHeroToBiggest = -1;
    if (monstersRanked.length > 0) {
      closestHeroToBiggest = this.closestEntityId(this.myHeroes, monstersRanked[0]);
    }
    let closestHeroToSecond = -1;
    if (monstersRanked.length > 1) {
      closestHeroToSecond = this.closestEntityId(
        this.myHeroes.filter((hero) => hero.id !== closestHeroToBiggest),
        monstersRanked[1],
      );
    }

    // Track which monsters are already being handled by a defender
    const monstersBeingDealt: number[] = [];
    // Track which monsters were already WINDed this turn (avoid double-wind)
    const windedMonsters: number[] = [];

    for (const hero of this.myHeroes) {
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
}

const game = new Game();
while (true) {
  game.initTurn();
  game.turn();
}
