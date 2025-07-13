declare function readline(): string; // Assuming a readline function is available

enum Direction {
  TopLeft = 'TL',
  TopRight = 'TR',
  BottomLeft = 'BL',
  BottomRight = 'BR',
}

class Position {
  constructor(
    public x: number,
    public y: number,
  ) {}
}

class Creature extends Position {
  playerScanned = false;
  opponentScanned = false;

  speedX = 0;
  speedY = 0;

  constructor(
    readonly id: number,
    readonly color: number,
    readonly type: number,
  ) {
    super(0, 0);
  }
}

class Drone extends Position {
  radarBlips: { creatureId: number; direction: Direction }[] = [];
  scans: number[] = [];

  constructor(
    readonly id: number,
    x: number,
    y: number,
    readonly emergency: number,
    readonly battery: number,
    readonly isPlayer: boolean,
  ) {
    super(x, y);
  }

  move(direction: Direction): Position {
    switch (direction) {
      case Direction.TopLeft:
        return new Position(this.x - Game.DRONE_SPEED, this.y - Game.DRONE_SPEED);

      case Direction.TopRight:
        return new Position(this.x + Game.DRONE_SPEED, this.y - Game.DRONE_SPEED);

      case Direction.BottomLeft:
        return new Position(this.x - Game.DRONE_SPEED, this.y + Game.DRONE_SPEED);

      case Direction.BottomRight:
        return new Position(this.x + Game.DRONE_SPEED, this.y + Game.DRONE_SPEED);

      default:
        return new Position(this.x, this.y);
    }
  }
}

class Game {
  static DRONE_SPEED = 600;
  static CREATURE_SPEED = 560;

  creatures: Record<number, Creature> = {};

  playerScore = 0;
  playerDrones: Drone[] = [];

  opponentScore = 0;
  opponentDrones: Drone[] = [];

  turns = 0;

  constructor() {
    const fishCount = Number.parseInt(readline(), 10);
    for (let i = 0; i < fishCount; i++) {
      const [fishId, color, type] = readline().split(' ').map(Number);
      this.creatures[fishId] = new Creature(fishId, color, type);
    }
  }

  initTurn() {
    this.turns++;

    this.playerScore = Number.parseInt(readline(), 10);
    this.opponentScore = Number.parseInt(readline(), 10);

    const playerScansCount = Number.parseInt(readline(), 10);
    const playerScans: number[] = [];
    for (let i = 0; i < playerScansCount; i++) {
      playerScans.push(Number.parseInt(readline(), 10));
    }

    const opponentScansCount = Number.parseInt(readline(), 10);
    const opponentScans: number[] = [];
    for (let i = 0; i < opponentScansCount; i++) {
      opponentScans.push(Number.parseInt(readline(), 10));
    }

    const playerDronesCount = Number.parseInt(readline(), 10);
    this.playerDrones = [];
    for (let i = 0; i < playerDronesCount; i++) {
      const [droneId, droneX, droneY, dead, battery] = readline().split(' ').map(Number);
      this.playerDrones.push(new Drone(droneId, droneX, droneY, dead, battery, true));
    }

    const opponentDronesCount = Number.parseInt(readline(), 10);
    this.opponentDrones = [];
    for (let i = 0; i < opponentDronesCount; i++) {
      const [droneId, droneX, droneY, dead, battery] = readline().split(' ').map(Number);
      this.opponentDrones.push(new Drone(droneId, droneX, droneY, dead, battery, false));
    }

    const drones = [...this.playerDrones, ...this.opponentDrones];
    const droneScansCount = Number.parseInt(readline(), 10);
    for (let i = 0; i < droneScansCount; i++) {
      const [droneId, fishId] = readline().split(' ').map(Number);
      const drone = drones.find(drone => drone.id === droneId)!;
      drone.scans.push(fishId);
      this.creatures[fishId][drone.isPlayer ? 'playerScanned' : 'opponentScanned'] = true;
    }

    const visibleFishesCount = Number.parseInt(readline(), 10);
    for (let i = 0; i < visibleFishesCount; i++) {
      const [fishId, fishX, fishY, fishVx, fishVy] = readline().split(' ').map(Number);
      this.creatures[fishId].x = fishX;
      this.creatures[fishId].y = fishY;
      this.creatures[fishId].speedX = fishVx;
      this.creatures[fishId].speedY = fishVy;
    }

    const playerRadarBlipsCount = Number.parseInt(readline(), 10);
    this.playerDrones.forEach((drone) => {
      drone.radarBlips = [];
    });
    for (let i = 0; i < playerRadarBlipsCount; i++) {
      const [_droneId, _fishId, direction] = readline().split(' ');
      const droneId = Number.parseInt(_droneId, 10);
      const fishId = Number.parseInt(_fishId, 10);

      this.playerDrones
        .find(drone => drone.id === droneId)!
        .radarBlips
        .push({ creatureId: fishId, direction: direction as Direction });
    }
  }

  turn() {
    for (const drone of this.playerDrones) {
      const light = this.turns % 5;
    }
  }
}

const game = new Game();
while (true) {
  game.initTurn();
  game.turn();
}
