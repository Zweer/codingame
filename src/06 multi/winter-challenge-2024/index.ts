/**
 * ****************************************************
 *  An organism-growing bot with typed enums and
 *  improved Harvester placement strategy.
 *****************************************************
 */

declare function readline(): string; // Assuming a readline function is available

function main() {
  const game = new Game();

  while (true) {
    game.initTurn(); // read the board state + proteins
    game.turn(); // decide and output an action
  }
}

/** Possible entity types on the grid */
enum TileType {
  Wall = 'WALL',
}

enum OrganType {
  Root = 'ROOT',
  Basic = 'BASIC',
  Harvester = 'HARVESTER',
}

enum ProteinType {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
}

/** Directions an organ can face. */
enum Direction {
  N = 'N',
  E = 'E',
  S = 'S',
  W = 'W',
}

class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}

  manhattanDistance(point: Point): number {
    return Math.abs(this.x - point.x) + Math.abs(this.y - point.y);
  }
}

class Tile extends Point {
  constructor(
    public x: number,
    public y: number,
    public type: TileType,
  ) {
    super(x, y);
  }
}

class Protein extends Point {
  constructor(
    public x: number,
    public y: number,
    public type: ProteinType,
  ) {
    super(x, y);
  }
}

type Owner = -1 | 0 | 1;

class Organ extends Point {
  constructor(
    public x: number,
    public y: number,
    public type: OrganType,
    public owner: Owner,
    public id: number,
    public direction: Direction,
    public parentId: number,
    public rootId: number,
  ) {
    super(x, y);
  }
}

class Board {
  tiles: (Tile | Protein | Organ)[][] = [];

  constructor(
    public width: number,
    public height: number,
  ) {
    this.reset();
  }

  reset() {
    this.tiles = new Array(this.height).fill(new Array(this.width).fill(null));
  }

  addTile(tile: Tile | Protein | Organ) {
    this.tiles[tile.y][tile.x] = tile;
  }
}

type ProteinStock = Record<ProteinType, number>;

class Game {
  board: Board;
  entityCount = 0;

  myOrgans: Organ[] = [];
  opponentOrgans: Organ[] = [];

  myProteins: ProteinStock = {
    [ProteinType.A]: 0,
    [ProteinType.B]: 0,
    [ProteinType.C]: 0,
    [ProteinType.D]: 0,
  };

  opponentProteins: ProteinStock = {
    [ProteinType.A]: 0,
    [ProteinType.B]: 0,
    [ProteinType.C]: 0,
    [ProteinType.D]: 0,
  };

  requiredActionsCount = 0;

  constructor() {
    // Read width, height
    const [width, height] = readline().split(' ').map(Number);
    this.board = new Board(width, height);
  }

  initTurn() {
    this.entityCount = Number.parseInt(readline(), 10);

    // Reset everything
    this.board.reset();
    this.myOrgans = [];
    this.opponentOrgans = [];

    // Read each entity
    for (let i = 0; i < this.entityCount; i++) {
      const inputs = readline().split(' ');
      const x = Number.parseInt(inputs[0], 10);
      const y = Number.parseInt(inputs[1], 10);
      const type = inputs[2];
      const owner = Number.parseInt(inputs[3], 10);
      const organId = Number.parseInt(inputs[4], 10);
      const organDir = inputs[5] as Direction; // not used in this sample
      const organParentId = Number.parseInt(inputs[6], 10);
      const organRootId = Number.parseInt(inputs[7], 10);

      let tile: Tile | Protein | Organ;
      if (Object.values(TileType).includes(type as TileType)) {
        tile = new Tile(x, y, type as TileType);
      } else if (Object.values(OrganType).includes(type as OrganType)) {
        tile = new Organ(x, y, type as OrganType, owner as Owner, organId, organDir, organParentId, organRootId);
      } else if (Object.values(ProteinType).includes(type as ProteinType)) {
        tile = new Protein(x, y, type as ProteinType);
      } else {
        throw new Error(`Invalid tile type: "${type}"`);
      }

      this.board.addTile(tile);
    }

    // My proteins
    let protInputs = readline().split(' ').map(Number);
    this.myProteins = {
      [ProteinType.A]: protInputs[0],
      [ProteinType.B]: protInputs[1],
      [ProteinType.C]: protInputs[2],
      [ProteinType.D]: protInputs[3],
    };

    // Opponent's proteins
    protInputs = readline().split(' ').map(Number);
    this.opponentProteins = {
      [ProteinType.A]: protInputs[0],
      [ProteinType.B]: protInputs[1],
      [ProteinType.C]: protInputs[2],
      [ProteinType.D]: protInputs[3],
    };

    // Required actions (1 in this league)
    this.requiredActionsCount = Number.parseInt(readline(), 10);
  }

  turn() {
    for (let i = 0; i < this.requiredActionsCount; i++) {
      // If no organs, we can't grow
      if (this.myOrgans.length === 0) {
        console.log('WAIT');
        continue;
      }

      // 1) Attempt to place a harvester if we don't already have one
      //    and if we have enough C and D
      const hasHarvester = this.myOrgans.some(organ => organ.type === OrganType.Harvester);
      if (
        !hasHarvester
        && this.myProteins[ProteinType.C] > 0
        && this.myProteins[ProteinType.D] > 0
      ) {
        const harvesterCmd = this.tryBuildHarvester();
        if (harvesterCmd) {
          console.log(harvesterCmd);
          continue; // done for this turn
        }
      }

      // 2) Otherwise, fallback to growing BASIC
      const growCmd = this.tryGrowBasic();
      if (growCmd) {
        console.log(growCmd);
      } else {
        console.log('WAIT');
      }
    }
  }

  /**
   * Attempt to build one HARVESTER adjacent to the best (closest) protein tile.
   * Return "GROW ..." if successful, else null.
   */
  private tryBuildHarvester(): string | null {
    // Gather all protein tiles (A,B,C,D)
    const proteinTiles: Tile[] = [];
    for (let y = 0; y < this.board.height; y++) {
      for (let x = 0; x < this.board.width; x++) {
        if (
          this.board.tiles[y][x].type === ProteinType.A
          || this.board.tiles[y][x].type === ProteinType.B
          || this.board.tiles[y][x].type === ProteinType.C
          || this.board.tiles[y][x].type === ProteinType.D
        ) {
          proteinTiles.push({ x, y });
        }
      }
    }
    if (proteinTiles.length === 0)
      return null; // no proteins => can't place harvester effectively

    // Find the best pair: (myOrgan, proteinTile) with minimal Manhattan distance
    let bestDistance = Number.MAX_VALUE;
    let bestOrgan: Organ | null = null;
    let bestProtein: Tile | null = null;

    for (const organ of this.myOrgans) {
      // skip if organ is HARVESTER or something else, but it's fine to use any organ
      for (const tile of proteinTiles) {
        const dist = this.manhattanDistance(organ.x, organ.y, tile.x, tile.y);
        if (dist < bestDistance) {
          bestDistance = dist;
          bestOrgan = organ;
          bestProtein = tile;
        }
      }
    }
    if (!bestOrgan || !bestProtein)
      return null;

    // Now find a free adjacent cell around that bestProtein tile
    const possibleDirs = [
      { dx: 0, dy: -1, dir: Direction.N },
      { dx: 1, dy: 0, dir: Direction.E },
      { dx: 0, dy: 1, dir: Direction.S },
      { dx: -1, dy: 0, dir: Direction.W },
    ];

    for (const possibleDir of possibleDirs) {
      const hx = bestProtein.x + -possibleDir.dx; // The harvester stands "opposite" the direction it's facing
      const hy = bestProtein.y + -possibleDir.dy;
      if (this.inBounds(hx, hy) && this.board[hy][hx] === null) {
        // We found a free spot where the harvester can be placed
        // The harvester must face from (hx, hy) -> (bestProtein.x, bestProtein.y)
        // That direction is d.dir
        const cmd = `GROW ${bestOrgan.organId} ${hx} ${hy} HARVESTER ${possibleDir.dir}`;
        return cmd;
      }
    }

    return null; // no free adjacent cell found
  }

  /**
   * Try to grow a BASIC organ from one of my organs if I have enough A.
   */
  private tryGrowBasic(): string | null {
    if (this.myProteins[ProteinType.A] <= 0)
      return null; // can't grow BASIC without A

    // Let's pick the first organ that we have and try the 4 directions
    // for a free adjacent cell.
    const fromOrgan = this.myOrgans[0];
    if (!fromOrgan)
      return null;

    // We can choose any direction for BASIC (the direction is rarely relevant),
    // but we must supply a direction in the command. Let's pick N for simplicity.
    // Alternatively, we can test all 4 directions for an immediate free space.
    const directions = [
      { dx: 0, dy: -1, dir: Direction.N },
      { dx: 1, dy: 0, dir: Direction.E },
      { dx: 0, dy: 1, dir: Direction.S },
      { dx: -1, dy: 0, dir: Direction.W },
    ];

    for (const direction of directions) {
      const nx = fromOrgan.x + direction.dx;
      const ny = fromOrgan.y + direction.dy;
      if (this.inBounds(nx, ny) && this.board[ny][nx] === null) {
        // Return the GROW command
        return `GROW ${fromOrgan.organId} ${nx} ${ny} BASIC ${direction.dir}`;
      }
    }

    // If no adjacent cell is free, try growing to the same spot anyway,
    // relying on the engine's path creation. But that's not likely to help if fully blocked.
    return null;
  }

  private inBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  private manhattanDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }
}

main();
