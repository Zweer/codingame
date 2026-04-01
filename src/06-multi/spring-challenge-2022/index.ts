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

  public turn(): void {
    // --- First 7 rounds: just move to starting positions ---
    // Attacker heads toward enemy half, defenders go to patrol zones.
    if (this.rounds < 7) {
      for (const hero of this.myHeroes) {
        const strategicPoint = Game.HEROES_STRATEGIC_POINTS[hero.id];
        hero.action = Game.createMoveAction(strategicPoint);
      }
    }

    // Output actions sorted by hero id (CodinGame expects hero 0/3 first)
    const sortedHeroes = [...this.myHeroes].sort((a, b) => a.id - b.id);
    for (const hero of sortedHeroes) {
      console.log(hero.action);
    }

    this.rounds++;
  }
}

const game = new Game();
while (true) {
  game.initTurn();
  game.turn();
}
