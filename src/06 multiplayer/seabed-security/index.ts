declare function readline(): string; // Assuming a readline function is available

class Vector {
  constructor(
    readonly x: number,
    readonly y: number,
  ) {}

  subtract(vector: Vector) {
    return new Vector(this.x - vector.x, this.y - vector.y);
  }

  dot(vector: Vector) {
    return this.x * vector.x + this.y * vector.y;
  }

  multiply(scalar: number) {
    return new Vector(this.x * scalar, this.y * scalar);
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  distance(destination: Vector) {
    const dx = this.x - destination.x;
    const dy = this.y - destination.y;

    return Math.sqrt(dx * dx + dy * dy);
  }
}

interface FishDetail {
  color: number;
  type: number;
}

interface Fish {
  fishId: number;
  pos: Vector;
  speed: Vector;
  detail: FishDetail;
}

class Drone {
  speed?: Vector;
  destination?: Vector;

  constructor(
    readonly droneId: number,
    readonly position: Vector,
    readonly dead: number,
    readonly battery: number,
    readonly scans: number[],
  ) {}

  distance(destination: Vector) {
    return this.position.distance(destination);
  }

  getDestination() {
    return new Vector(this.position.x + this.speed.x, this.position.y + this.speed.y);
  }
}

interface RadarBlip {
  fishId: number;
  dir: string;
}

class Game {
  static DRONE_SPEED = 600;
  static MONSTER_SPEED = 540;

  static MAP_WIDTH = 10000;
  static MAP_HEIGHT = 10000;
  static SURFACE_HEIGHT = 490;

  readonly fishDetails: Record<number, FishDetail> = {};

  myScans: number[] = [];
  foeScans: number[] = [];
  droneById = new Map<number, Drone>();
  myDrones: Drone[] = [];
  foeDrones: Drone[] = [];
  visibleFish: Fish[] = [];
  myRadarBlips = new Map<number, RadarBlip[]>();

  myScore = 0;
  foeScore = 0;

  constructor() {
    const fishCount = Number.parseInt(readline(), 10);
    for (let i = 0; i < fishCount; i++) {
      const [fishId, color, type] = readline().split(' ').map(Number);
      this.fishDetails[fishId] = { color, type };
    }
  }

  initTurn() {
    this.myScans = [];
    this.foeScans = [];
    this.droneById = new Map<number, Drone>();
    this.myDrones = [];
    this.foeDrones = [];
    this.visibleFish = [];
    this.myRadarBlips = new Map<number, RadarBlip[]>();

    this.myScore = Number.parseInt(readline(), 10);
    this.foeScore = Number.parseInt(readline(), 10);

    const myScanCount = Number.parseInt(readline(), 10);
    for (let i = 0; i < myScanCount; i++) {
      const fishId = Number.parseInt(readline(), 10);
      this.myScans.push(fishId);
    }

    const foeScanCount = Number.parseInt(readline(), 10);
    for (let i = 0; i < foeScanCount; i++) {
      const fishId = Number.parseInt(readline(), 10);
      this.foeScans.push(fishId);
    }

    const myDroneCount = Number.parseInt(readline(), 10);
    for (let i = 0; i < myDroneCount; i++) {
      const [droneId, droneX, droneY, dead, battery] = readline().split(' ').map(Number);
      const pos = { x: droneX, y: droneY };
      const drone = { droneId, pos, dead, battery, scans: [] };
      this.droneById.set(droneId, drone);
      this.myDrones.push(drone);
      this.myRadarBlips.set(droneId, []);
    }

    const foeDroneCount = Number.parseInt(readline(), 10);
    for (let i = 0; i < foeDroneCount; i++) {
      const [droneId, droneX, droneY, dead, battery] = readline().split(' ').map(Number);
      const pos = { x: droneX, y: droneY };
      const drone = { droneId, pos, dead, battery, scans: [] };
      this.droneById.set(droneId, drone);
      this.foeDrones.push(drone);
    }

    const droneScanCount = Number.parseInt(readline(), 10);
    for (let i = 0; i < droneScanCount; i++) {
      const [droneId, fishId] = readline().split(' ').map(Number);
      this.droneById.get(droneId)!.scans.push(fishId);
    }

    const visibleFishCount = Number.parseInt(readline(), 10);
    for (let i = 0; i < visibleFishCount; i++) {
      const [fishId, fishX, fishY, fishVx, fishVy] = readline().split(' ').map(Number);
      const pos = { x: fishX, y: fishY };
      const speed = { x: fishVx, y: fishVy };
      this.visibleFish.push({ fishId, pos, speed, detail: this.fishDetails[fishId] });
    }

    const myRadarBlipCount = Number.parseInt(readline(), 10);
    for (let i = 0; i < myRadarBlipCount; i++) {
      const [_droneId, _fishId, dir] = readline().split(' ');
      const droneId = Number.parseInt(_droneId, 10);
      const fishId = Number.parseInt(_fishId, 10);
      this.myRadarBlips.get(droneId)!.push({ fishId, dir });
    }
  }

  turn() {
    for (const drone of this.myDrones) {
      const x = drone.pos.x;
      const y = drone.pos.y;
      // TODO: Implement logic on where to move here
      const targetX = 5000;
      const targetY = 5000;
      const light = 1;

      console.log(`MOVE ${targetX} ${targetY} ${light}`);
    }
  }
}

const game = new Game();
while (true) {
  game.initTurn();
  game.turn();
}
