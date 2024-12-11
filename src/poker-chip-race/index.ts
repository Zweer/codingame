declare function readline(): string; // Assuming a readline function is available

class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}

  distance2(point: Point): number {
    return (this.x - point.x) ** 2 + (this.y - point.y) ** 2;
  }

  distance(point: Point): number {
    return Math.sqrt(this.distance2(point));
  }

  closest(pointA: Point, pointB: Point): Point {
    const da = pointB.y - pointA.y;
    const db = pointA.x - pointB.x;
    const c1 = da * pointA.x + db * pointA.y;
    const c2 = -db * this.x + da * this.y;
    const det = da ** 2 + db ** 2;

    return det
      ? new Point((da * c1 - db * c2) / det, (da * c2 + db * c1) / det)
      : new Point(this.x, this.y);
  }
}

class Target extends Point {
  timeToTarget?: number;

  constructor(
    public x: number,
    public y: number,
    public id: number,
    public text: string,
    public type: number,
  ) {
    super(x, y);
  }

  toString(): string {
    return `${this.x} ${this.y} ${this.text} ${this.id}`;
  }
}

class Blob extends Point {
  static SHRINK_FACTOR = Math.sqrt(1 - 1 / 15);

  public mass: number;
  public speed: number;

  target?: Target;

  constructor(
    public id: number,
    public player: number,
    public radius: number,
    public x: number,
    public y: number,
    public speedX: number,
    public speedY: number,
  ) {
    super(x, y);
    this.mass = this.radius * this.radius;
    this.speed = this.speedX ** 2 + this.speedY ** 2;
  }

  write(): void {
    console.log(`${this.target ?? 'WAIT WAIT'}`);
  }

  move(times: number): void {
    this.x += this.speedX * times;
    this.y += this.speedY * times;

    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.speedX *= -1;
    }
    if (this.x + this.radius > Game.MAX_WIDTH) {
      this.x = Game.MAX_WIDTH * 2 - this.x - this.radius;
      this.speedX *= -1;
    }

    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.speedY *= -1;
    }
    if (this.y + this.radius > Game.MAX_HEIGHT) {
      this.y = Game.MAX_HEIGHT * 2 - this.y - this.radius;
      this.speedY *= -1;
    }
  }

  expel(point: Point) {
    const distance = this.distance(point);
    this.speedX += (((point.x - this.x) / distance) * 200) / 14;
    this.speedY += (((point.y - this.y) / distance) * 200) / 14;
    this.radius *= Blob.SHRINK_FACTOR;
  }

  play(): void {
    if (this.id > -1 && this.target) {
      this.expel(this.target);
    } else {
      this.move(1);
    }
  }

  runTarget(blob: Blob): void {
    blob.play();

    this.target = new Target(
      this.x + this.x - blob.x - this.speedX,
      this.y + this.y - blob.y - this.speedY,
      blob.id,
      'RUN',
      -1,
    );
  }

  attackTarget(blob: Blob): void {
    blob.play();

    this.target = new Target(blob.x - this.speedX, blob.y - this.speedY, blob.id, 'ATT', 1);
  }

  timeToCollision(blob: Blob): number {
    const noCol = Infinity;
    const distance = this.distance2(blob);
    const squaredRadius = (this.radius + blob.radius) ** 2;
    // Objects are already touching each other. We have an immediate collision.
    if (distance < squaredRadius) {
      return 0;
    }

    // Optimisation. Objects with the same speed will never collide
    if (this.speedX === blob.speedX && this.speedY === blob.speedY) {
      return noCol;
    }

    // We place ourselves in the reference frame of B. B is therefore stationary and is at (0,0)
    const meanPoint = new Point(this.x - blob.x, this.y - blob.y);
    const speedX = this.speedX - blob.speedX;
    const speedY = this.speedY - blob.speedY;
    const origin = new Point(0, 0);
    const speedPoint = new Point(meanPoint.x + speedX, meanPoint.y + speedY);

    // We look for the closest point to B (which is in (0,0)) on the line described by our speed vector
    const closest = origin.closest(meanPoint, speedPoint);
    // Square of the distance between B and the closest point to B on the line described by our speed vector
    const pdist = origin.distance2(closest);
    // Square of the distance between us and that point
    const mypdist = meanPoint.distance2(closest);

    // If the distance between B and this line is less than the sum of the radii, there might be a collision
    if (pdist < squaredRadius) {
      // Our speed on the line
      const length = Math.sqrt(speedX ** 2 + speedY ** 2);

      // We move along the line to find the point of impact
      const backdist = Math.sqrt(squaredRadius - pdist);
      closest.x -= backdist * (speedX / length);
      closest.y -= backdist * (speedY / length);

      // If the point is now further away it means we are not going the right way, therefore the collision won't happen
      if (meanPoint.distance2(closest) > mypdist) {
        return noCol;
      }

      // Time needed to reach the impact point
      return closest.distance(meanPoint) / length;
    }

    return noCol;
  }

  findRunTarget(blobs: Blob[]): void {
    let min = Game.MAX_TIME_TO_COLLISION;
    for (const blob of blobs) {
      if (blob.player !== this.player) {
        const timeToCollision = this.timeToCollision(blob);
        if (timeToCollision < Game.MAX_TIME_TO_COLLISION) {
          if (this.radius < blob.radius && timeToCollision < min) {
            this.runTarget(blob);
            min = timeToCollision;
          }
        }
      }
    }
  }

  findAttackTarget(blobs: Blob[]): void {
    let minDistance = Infinity;
    let minTimeToCollision = Infinity;

    for (const blob of blobs) {
      if (blob.id !== this.id) {
        const distance = this.distance(blob);
        const dot = this.speedX * blob.speedX + this.speedY * blob.speedY;
        const timeToCollision = this.timeToCollision(blob);

        if (
          distance < minDistance &&
          this.radius > 1.1 * blob.radius &&
          distance < 5 * this.radius
        ) {
          if (
            blob.radius > 25 ||
            (dot <= 0 && this.radius < 30) ||
            distance < 1.3 * (this.radius + blob.radius)
          ) {
            if (timeToCollision <= minTimeToCollision) {
              minDistance = distance;
              minTimeToCollision = timeToCollision;
              this.attackTarget(blob);
            }
          }
        }
      }
    }
  }

  aimLargest(blobs: Blob[]): void {
    let totalMass = 0;
    for (const blob of blobs) {
      totalMass += blob.mass;
    }

    if (Game.MASS_SAFE_COEFFICIENT * this.mass > totalMass) {
      this.target = undefined;
    }
  }
}

export class Game {
  static MAX_WIDTH = 800;
  static MAX_HEIGHT = 515;

  static MAX_TIME_TO_COLLISION = 10;

  static MASS_SAFE_COEFFICIENT = 2;

  playerId: number;
  blobs: Blob[] = [];

  constructor() {
    this.playerId = Number(readline());
  }

  initTurn(): void {
    this.blobs = [];

    // The number of chips under your control
    const playerChipCount = Number(readline());
    // The total number of entities on the table, including your chips
    const entityCount = Number(readline());
    for (let i = 0; i < entityCount; i++) {
      const [id, player, radius, x, y, speedX, speedY] = readline().split(' ').map(Number);
      this.blobs.push(new Blob(id, player, radius, x, y, speedX, speedY));
    }
  }

  turn(): void {
    // find targets of enemies
    for (const blob of this.blobs) {
      if (blob.player !== this.playerId && blob.player !== -1) {
        blob.findAttackTarget(this.blobs);
        blob.findRunTarget(this.blobs);
        blob.aimLargest(this.blobs);
      }
    }

    // Loop through my blobs and find my targets
    for (const blob of this.blobs) {
      if (blob.player === this.playerId) {
        blob.findAttackTarget(this.blobs);
        blob.findRunTarget(this.blobs);
        blob.aimLargest(this.blobs);
      }
    }

    for (const blob of this.blobs) {
      if (blob.player === this.playerId) {
        blob.write();
      }
    }
  }
}

if (process.env.NODE_ENV !== 'test') {
  const game = new Game();
  game.initTurn();
  game.turn();
}
