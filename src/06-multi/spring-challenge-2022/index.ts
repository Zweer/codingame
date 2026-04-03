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

  dist(other: Point): number {
    return Math.hypot(this.x - other.x, this.y - other.y);
  }
}

/** All entity fields from the game input */
interface Entity {
  id: number; // Unique identifier
  type: EntityType; // monster, my hero, opponent hero
  coords: Point; // Position
  shieldLife: number; // Turns remaining on SHIELD spell (0 = none)
  isControlled: boolean; // if under CONTROL spell this turn
  health?: number; // Monster HP (null for heroes)
  vx?: number; // Monster velocity X (null for heroes)
  vy?: number; // Monster velocity Y (null for heroes)
  isNearBase: boolean; // if monster is targeting a base
  threatFor: ThreatForType; // neither, my base, enemy base
  action: string; // The command this entity will execute
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
    3: {
      min: new Point(Game.FIELD_WIDTH - 9000, Game.FIELD_HEIGHT - 6000),
      max: new Point(Game.FIELD_WIDTH, Game.FIELD_HEIGHT),
    },
    4: {
      min: new Point(Game.FIELD_WIDTH - 6000, Game.FIELD_HEIGHT - 9000),
      max: new Point(Game.FIELD_WIDTH, Game.FIELD_HEIGHT),
    },
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
    1: [new Point(7250, 2250), new Point(7000, 3000), new Point(6750, 3750), new Point(7000, 3000)],
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
    2: [new Point(4250, 5250), new Point(4000, 6000), new Point(3750, 6750), new Point(4000, 6000)],
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
      case 1:
        return ThreatForType.MY_BASE;

      case 2:
        return ThreatForType.ENEMY_BASE;

      default:
        return ThreatForType.NEITHER;
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

  // Patrol indices (cycle through patrol points)
  private iAtkPt = 0;
  private iDef1Pt = 0;
  private iDef2Pt = 0;

  // Pushed monster tracking — after WIND, attacker chases predicted position for follow-up SHIELD
  private moveToPushed = false;
  private pushedId = -1;
  private pushedCoords = new Point(0, 0);
  private pushedVx = 0;
  private pushedVy = 0;
  private pushedRounds = 0;

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
    this.initialPosition =
      baseX === 0 ? InitialPositionType.TOP_LEFT : InitialPositionType.BOTTOM_RIGHT;
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

  /** Get monsters within maxDist of base, sorted by distance (closest first) */
  private closestMonstersToBase(base: Point, maxDist: number): { d: number; m: Entity }[] {
    const result: { d: number; m: Entity }[] = [];
    for (const m of this.monsters) {
      const d = base.dist(m.coords);
      if (d <= maxDist) result.push({ d, m });
    }
    result.sort((a, b) => a.d - b.d);
    return result;
  }

  /**
   * Get monsters near base, filtered to this hero's guard zone.
   * Attacker (id 0/5) sees all. Defenders only see monsters in their zone.
   */
  private closestMonstersToHeroFromBase(
    hero: Entity,
    base: Point,
    maxDist: number,
  ): { d: number; m: Entity }[] {
    const baseMons = this.closestMonstersToBase(base, maxDist);
    const result: { d: number; m: Entity }[] = [];
    for (const bm of baseMons) {
      const d = hero.coords.dist(bm.m.coords);
      if (hero.id === 0 || hero.id === 5) {
        result.push({ d, m: bm.m });
      } else {
        const th = Game.GUARDS_THRESHOLDS[hero.id];
        if (
          th &&
          bm.m.coords.x >= th.min.x &&
          bm.m.coords.x <= th.max.x &&
          bm.m.coords.y >= th.min.y &&
          bm.m.coords.y <= th.max.y
        ) {
          result.push({ d, m: bm.m });
        }
      }
    }
    result.sort((a, b) => a.d - b.d);
    return result;
  }

  /** Closest enemy hero to a base */
  private closestEnemyToBase(base: Point): { d: number; e: Entity } | null {
    let best: { d: number; e: Entity } | null = null;
    for (const e of this.enemyHeroes) {
      const d = base.dist(e.coords);
      if (!best || d < best.d) best = { d, e };
    }
    return best;
  }

  /** Closest enemy hero to one of our heroes */
  private closestEnemyToHero(hero: Entity): { e: Entity | null; d: number } {
    let best: { e: Entity | null; d: number } = { e: null, d: Infinity };
    for (const e of this.enemyHeroes) {
      const d = hero.coords.dist(e.coords);
      if (d < best.d) best = { e, d };
    }
    return best;
  }

  /** Closest enemy hero to a specific monster */
  private closestEnemyToMonster(monster: Entity): { d: number; e: Entity } | null {
    let best: { d: number; e: Entity } | null = null;
    for (const e of this.enemyHeroes) {
      const d = monster.coords.dist(e.coords);
      if (!best || d < best.d) best = { d, e };
    }
    return best;
  }

  /** Count unshielded monsters within WIND range (1280) of hero */
  private unshieldedMonstersInWindRange(hero: Entity): number {
    let count = 0;
    for (const m of this.monsters) {
      if (hero.coords.dist(m.coords) <= 1280 && !m.shieldLife) count++;
    }
    return count;
  }

  /** Count monsters within SPELL range (2200) of hero */
  private monstersInRange(hero: Entity): number {
    let count = 0;
    for (const m of this.monsters) {
      if (hero.coords.dist(m.coords) <= 2200) count++;
    }
    return count;
  }

  private isInZone(monster: Entity, heroId: number): boolean {
    const th = Game.GUARDS_THRESHOLDS[heroId];
    if (!th) return false;
    return (
      monster.coords.x >= th.min.x &&
      monster.coords.x <= th.max.x &&
      monster.coords.y >= th.min.y &&
      monster.coords.y <= th.max.y
    );
  }

  private trackPushedMonster(monster: Entity, coords: Point): void {
    this.moveToPushed = true;
    this.pushedId = monster.id;
    this.pushedCoords = coords;
    this.pushedVx = monster.vx ?? 0;
    this.pushedVy = monster.vy ?? 0;
  }

  private isAttacker(hero: Entity): boolean {
    return hero.id === 0 || hero.id === 5;
  }

  private canSpend(cost: number): boolean {
    return this.myMana >= cost;
  }

  private spendMana(cost: number): void {
    this.myMana -= cost;
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

  private doNonSetupTurn(): void {
    const monstersRanked = this.rankMonsters(this.base, ThreatForType.MY_BASE);
    const enemyMonstersRanked = this.rankMonsters(this.enemyBase, ThreatForType.ENEMY_BASE);

    let closestHeroToBiggest = -1;
    if (monstersRanked.length > 0) {
      closestHeroToBiggest = this.closestEntityId(this.myHeroes, monstersRanked[0]);
    }
    let closestHeroToSecond = -1;
    if (monstersRanked.length > 1) {
      closestHeroToSecond = this.closestEntityId(
        this.myHeroes.filter((h) => h.id !== closestHeroToBiggest),
        monstersRanked[1],
      );
    }

    const monstersBeingDealt: number[] = [];

    for (const hero of this.myHeroes) {
      if (this.isAttacker(hero)) {
        this.doAttackerTurn(hero, enemyMonstersRanked);
      } else {
        this.doDefenderTurn(
          hero,
          monstersRanked,
          closestHeroToBiggest,
          closestHeroToSecond,
          monstersBeingDealt,
        );
      }
    }
  }

  private doAttackerTurn(hero: Entity, enemyMonstersRanked: Entity[]): void {
    // Update attacker patrol point
    const pts = Game.ATTACKER_POINTS[hero.id];
    const patrolPt = pts[this.iAtkPt % pts.length];
    Game.HEROES_STRATEGIC_POINTS[hero.id] = patrolPt;

    // Only consider enemy-base monsters within spell range (2200) of attacker
    const atkEnemyMonsters = enemyMonstersRanked.filter((m) => hero.coords.dist(m.coords) <= 2200);

    // --- FOLLOW-UP MODE: after WINDing a monster, chase its predicted position ---
    if (this.moveToPushed) {
      let x = this.pushedCoords.x;
      let y = this.pushedCoords.y;
      x = x > hero.coords.x ? x - 600 : x + 600;
      y = y > hero.coords.y ? y - 600 : y + 600;
      hero.action = `MOVE ${x} ${y} mv_to`;

      const reachedTarget =
        (this.initialPosition === InitialPositionType.TOP_LEFT &&
          hero.coords.x >= this.pushedCoords.x &&
          hero.coords.y >= this.pushedCoords.y) ||
        (this.initialPosition === InitialPositionType.BOTTOM_RIGHT &&
          hero.coords.x <= this.pushedCoords.x &&
          hero.coords.y <= this.pushedCoords.y);

      if (
        reachedTarget ||
        this.pushedRounds >= 4 ||
        atkEnemyMonsters.some((m) => m.id === this.pushedId) ||
        hero.coords.dist(this.enemyBase) <= 400 + 2200
      ) {
        this.moveToPushed = false;
        this.pushedRounds = 0;
      } else {
        this.pushedCoords = new Point(
          this.pushedCoords.x + this.pushedVx,
          this.pushedCoords.y + this.pushedVy,
        );
        this.pushedRounds++;
      }
      return;
    }

    if (atkEnemyMonsters.length === 0) {
      hero.action = `${Game.createMoveAction(Game.HEROES_STRATEGIC_POINTS[hero.id])} nxt`;
      this.iAtkPt++;
      return;
    }

    this.doAttackerSpells(hero, atkEnemyMonsters);
  }

  private doAttackerSpells(hero: Entity, atkEnemyMonsters: Entity[]): void {
    const monster = atkEnemyMonsters[0];
    const hmd = hero.coords.dist(monster.coords);
    const ebmd = this.enemyBase.dist(monster.coords);
    const ebhd = hero.coords.dist(this.enemyBase);
    const numRange = this.monstersInRange(hero);
    const numUnshieldedWind = this.unshieldedMonstersInWindRange(hero);
    const { e: closestEnemy, d: closestEnemyDist } = this.closestEnemyToHero(hero);
    let closestEnemyMonsterDist = Infinity;
    if (closestEnemy) {
      closestEnemyMonsterDist = closestEnemy.coords.dist(monster.coords);
    }

    const mvx = monster.vx ?? 0;
    const mvy = monster.vy ?? 0;

    // 1. SHIELD monster heading to enemy base with enough HP to survive
    if (
      this.canSpend(10) &&
      !monster.shieldLife &&
      !monster.isControlled &&
      monster.threatFor === ThreatForType.ENEMY_BASE &&
      hmd <= 2200
    ) {
      for (let i = 1; i < 16; i++) {
        if (ebmd <= 400 * i && (monster.health ?? 0) >= 2 * i) {
          hero.action = `SPELL SHIELD ${monster.id} shld`;
          this.spendMana(10);
          return;
        }
      }
    }

    // 2. WIND enemy hero away from our monster
    if (
      this.canSpend(10) &&
      closestEnemy &&
      !closestEnemy.shieldLife &&
      closestEnemyDist <= 1280 &&
      closestEnemyMonsterDist <= hmd &&
      numRange > 0 &&
      numUnshieldedWind === 0 &&
      monster.threatFor === ThreatForType.ENEMY_BASE &&
      ebmd <= 6500
    ) {
      const wx = closestEnemy.coords.x - mvx * 2200;
      const wy = closestEnemy.coords.y - mvy * 2200;
      hero.action = `SPELL WIND ${wx} ${wy} wnd_out_enm`;
      this.spendMana(10);
      if (ebmd < ebhd && (monster.health ?? 0) >= 4) {
        this.trackPushedMonster(monster, new Point(monster.coords.x + mvx, monster.coords.y + mvy));
      }
      return;
    }

    // 3. WIND monster toward enemy base — main scoring move
    if (this.canSpend(10) && !monster.shieldLife && hmd <= 1280 && ebmd <= 8000) {
      const wx = hero.coords.x + (this.enemyBase.x - monster.coords.x);
      const wy = hero.coords.y + (this.enemyBase.y - monster.coords.y);
      const newX = Math.round(
        monster.coords.x + ((monster.coords.x - this.enemyBase.x) * -2200) / ebmd,
      );
      const newY = Math.round(
        monster.coords.y + ((monster.coords.y - this.enemyBase.y) * -2200) / ebmd,
      );
      hero.action = `SPELL WIND ${wx} ${wy} wnd_in`;
      this.spendMana(10);
      this.trackPushedMonster(monster, new Point(newX, newY));
      return;
    }

    // 4. CONTROL enemy hero — send them to OUR base
    if (
      this.canSpend(10) &&
      closestEnemy &&
      !closestEnemy.shieldLife &&
      closestEnemyDist <= 2200 &&
      ebmd <= 6500
    ) {
      const shouldCtrl =
        (closestEnemyMonsterDist > 800 * 2 && (monster.health ?? 0) >= 2) ||
        (closestEnemyMonsterDist <= 800 * 2 && (monster.health ?? 0) >= 6);
      if (shouldCtrl) {
        hero.action = `SPELL CONTROL ${closestEnemy.id} ${this.base.x} ${this.base.y} ctrl_out_enm`;
        this.spendMana(10);
        if (ebmd < ebhd && (monster.health ?? 0) >= 4) {
          this.trackPushedMonster(
            monster,
            new Point(monster.coords.x + mvx, monster.coords.y + mvy),
          );
        }
        return;
      }
    }

    // 5. CONTROL monster toward enemy base
    if (
      this.canSpend(10) &&
      !monster.shieldLife &&
      monster.threatFor !== ThreatForType.ENEMY_BASE &&
      hmd <= 2200 &&
      ebmd > 5000
    ) {
      let shouldCtrl = false;
      if (!closestEnemy) {
        shouldCtrl = true;
      } else {
        for (let i = 2; i < 8; i++) {
          if (closestEnemyMonsterDist <= 800 * i && (monster.health ?? 0) >= 2 * (i + 1)) {
            if (hmd >= closestEnemyMonsterDist) {
              shouldCtrl = true;
              break;
            }
          }
        }
      }
      if (shouldCtrl) {
        hero.action = `SPELL CONTROL ${monster.id} ${this.enemyBase.x} ${this.enemyBase.y} ctrl_in`;
        this.spendMana(10);
        if (ebmd < ebhd && (monster.health ?? 0) >= 4) {
          this.trackPushedMonster(
            monster,
            new Point(monster.coords.x + mvx, monster.coords.y + mvy),
          );
        }
        return;
      }
    }

    // 6. MOVE toward monster
    if (ebmd <= 8000 && !monster.shieldLife) {
      let x = monster.coords.x + mvx;
      let y = monster.coords.y + mvy;
      x = x > hero.coords.x ? x - 850 : x + 850;
      y = y > hero.coords.y ? y - 850 : y + 850;
      hero.action = `MOVE ${x} ${y} flw`;
      return;
    }

    // 7. Advance to next patrol point
    hero.action = `${Game.createMoveAction(Game.HEROES_STRATEGIC_POINTS[hero.id])} nxt`;
    this.iAtkPt++;
  }

  private advanceDefenderPatrol(hero: Entity): void {
    if (hero.id === 1 || hero.id === 3) this.iDef1Pt++;
    else if (hero.id === 2 || hero.id === 4) this.iDef2Pt++;
  }

  private doDefenderTurn(
    hero: Entity,
    monstersRanked: Entity[],
    closestHeroToBiggest: number,
    closestHeroToSecond: number,
    monstersBeingDealt: number[],
  ): void {
    // Update patrol point for this defender
    if (hero.id === 1 || hero.id === 3) {
      const pts = Game.DEFENDER_1_POINTS[hero.id];
      Game.HEROES_STRATEGIC_POINTS[hero.id] = pts[this.iDef1Pt % pts.length];
    } else if (hero.id === 2 || hero.id === 4) {
      const pts = Game.DEFENDER_2_POINTS[hero.id];
      Game.HEROES_STRATEGIC_POINTS[hero.id] = pts[this.iDef2Pt % pts.length];
    }

    if (monstersRanked.length === 0) {
      this.doDefenderIdle(hero);
      return;
    }

    // Find which monster this defender should handle
    let monster: Entity | null = null;
    const m0 = monstersRanked[0];

    if (
      (hero.id === closestHeroToBiggest ||
        (m0.health ?? 0) > (this.base.dist(m0.coords) / 400) * 2) &&
      this.isInZone(m0, hero.id)
    ) {
      monster = m0;
    } else if (monstersRanked.length > 1 && hero.id === closestHeroToSecond) {
      const m1 = monstersRanked[1];
      if (this.isInZone(m1, hero.id)) monster = m1;
    }

    if (!monster) {
      const closest = this.closestMonstersToHeroFromBase(hero, this.base, 8000);
      const found = closest.find((c) => !monstersBeingDealt.includes(c.m.id));
      if (!found) {
        hero.action = `${Game.createMoveAction(Game.HEROES_STRATEGIC_POINTS[hero.id])} nxt`;
        this.advanceDefenderPatrol(hero);
        return;
      }
      monster = found.m;
    }

    const hmd = hero.coords.dist(monster.coords);
    const bmd = this.base.dist(monster.coords);
    const cem = this.closestEnemyToMonster(monster);
    const emd = cem ? cem.d : Infinity;

    // WIND monster away if: enemy nearby and monster very close, or HP too high to kill in time
    if (
      this.canSpend(10) &&
      !monster.shieldLife &&
      hmd <= 1280 &&
      ((emd <= 1280 && bmd <= 2200 + 400) || (monster.health ?? 0) > (bmd / 400) * 2)
    ) {
      hero.action = `SPELL WIND ${this.enemyBase.x} ${this.enemyBase.y} wnd_out`;
      this.spendMana(10);
    } else {
      hero.action = `MOVE ${monster.coords.x} ${monster.coords.y} flw`;
    }

    monstersBeingDealt.push(monster.id);
  }

  private doDefenderIdle(hero: Entity): void {
    const ceb = this.closestEnemyToBase(this.base);
    if (ceb && ceb.d <= 6500) {
      hero.action = `MOVE ${ceb.e.coords.x} ${ceb.e.coords.y} flw_enm`;
    } else {
      hero.action = `${Game.createMoveAction(Game.HEROES_STRATEGIC_POINTS[hero.id])} nxt`;
      this.advanceDefenderPatrol(hero);
    }
  }
}

const game = new Game();
while (true) {
  game.initTurn();
  game.turn();
}
