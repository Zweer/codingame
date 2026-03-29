/**
 * Save the Planet.
 * Use less Fossil Fuel.
 */

declare function readline(): string; // Assuming a readline function is available

class Shuttle {
  x = 0;
  y = 0;

  horizontalSpeed = 0;
  verticalSpeed = 0;

  horizontalAcceleration = 0;
  verticalAcceleration = 0;

  fuel = 0;
  rotation = 0; // Math.abs(rotation) <= Game.MAX_ANGLE
  power = 0; // 0 <= power <= Game.MAX_POWER

  update(updateString: string): void {
    const prevHorizontalSpeed = this.horizontalSpeed;
    const prevVerticalSpeed = this.verticalSpeed;

    [
      this.x,
      this.y,
      this.horizontalSpeed,
      this.verticalSpeed,
      this.fuel,
      this.rotation,
      this.power,
    ] = updateString.split(' ').map(Number);

    this.horizontalAcceleration = this.horizontalSpeed - prevHorizontalSpeed;
    this.verticalAcceleration = this.verticalSpeed - prevVerticalSpeed;
  }

  toString(): string {
    return `${this.rotation} ${this.power}`;
  }
}

class Game {
  static GRAV = 3.711;
  static POD_RADIUS = 5;
  static MAX_VSPEED_LANDING = 40;
  static MAX_HSPEED_LANDING = 20;
  static MAX_POWER = 4;
  static MAX_ANGLE = 90;
  static DANGER_LANDING_ANGLE = 30;
  static FAST_LANDING_ANGLE = 45;

  landingStart = 0;
  landingEnd = 7000;
  landingHeight = 0;

  shuttle = new Shuttle();

  directionMultiplier = 0;
  highestDot = 0;

  constructor() {
    const pointsCount = Number.parseInt(readline(), 10);
    let prevLandingX = 0;
    let prevLandingY = 0;
    for (let i = 0; i < pointsCount; i++) {
      const [landX, landY] = readline().split(' ').map(Number);

      if (prevLandingX !== 0 && prevLandingY === landY) {
        this.landingHeight = landY;
        this.landingStart = prevLandingX;
        this.landingEnd = landX;
      }

      if (this.highestDot < landY) {
        this.highestDot = landY;
      }

      prevLandingX = landX;
      prevLandingY = landY;
    }

    console.error('landingStart:', this.landingStart);
    console.error('landingEnd:', this.landingEnd);
    console.error('landingHeight:', this.landingHeight);
  }

  initTurn() {
    this.shuttle.update(readline());

    if (this.landingStart < this.shuttle.x && this.shuttle.x < this.landingEnd) {
      this.directionMultiplier = 0;
    } else if (this.shuttle.x < this.landingStart) {
      this.directionMultiplier = -1;
    } else {
      this.directionMultiplier = 1;
    }

    console.error('getDistance:', this.getDistance());
    console.error('horizontalAcceleration:', this.shuttle.horizontalAcceleration);
    console.error('verticalAcceleration:', this.shuttle.verticalAcceleration);
  }

  turn2() {
    this.goToSafeZone();
    this.landing();

    console.log(`${this.shuttle}`);
  }

  turn() {
    this.shuttle.rotation = this.getRotation();
    this.shuttle.power = this.getPower();

    console.log(`${this.shuttle}`);
  }

  protected goToSafeZone() {
    if (this.directionMultiplier) {
      let angle;
      let speed;
      if (this.shuttle.y - this.highestDot < 500) {
        angle = Game.DANGER_LANDING_ANGLE;
        speed = Game.MAX_HSPEED_LANDING;
      } else {
        angle = Game.FAST_LANDING_ANGLE;
        speed = Game.MAX_HSPEED_LANDING * 2;
      }

      this.shuttle.power = 4;

      if (-this.directionMultiplier * this.shuttle.horizontalSpeed < speed) {
        this.shuttle.rotation = this.directionMultiplier * angle;
      } else if (-this.directionMultiplier * this.shuttle.horizontalSpeed > speed + 5) {
        this.shuttle.rotation = -this.directionMultiplier * angle;
      } else {
        this.shuttle.rotation = 0;
      }
    } else {
      this.checkHorizontal();
    }
  }

  protected checkHorizontal() {
    if (
      Math.abs(this.shuttle.horizontalSpeed) > Game.MAX_HSPEED_LANDING
      || (this.shuttle.horizontalSpeed > 0 && this.landingEnd - this.shuttle.x < 500)
      || (this.shuttle.horizontalSpeed < 0 && this.landingStart - this.shuttle.x < -500)
    ) {
      this.shuttle.rotation = this.shuttle.horizontalSpeed * 3;
      if (this.shuttle.rotation > Game.DANGER_LANDING_ANGLE) {
        this.shuttle.rotation = Game.DANGER_LANDING_ANGLE;
      } else if (this.shuttle.rotation < -Game.DANGER_LANDING_ANGLE) {
        this.shuttle.rotation = -Game.DANGER_LANDING_ANGLE;
      }
    } else {
      this.shuttle.rotation = 0;
    }
  }

  protected landing() {
    if (
      (this.shuttle.verticalSpeed < -(Game.MAX_VSPEED_LANDING - 5)
        || this.shuttle.rotation !== 0
        || this.directionMultiplier !== 0)
      && this.shuttle.y < 2800
    ) {
      this.shuttle.power = 4;
    } else {
      this.shuttle.power = 3;
    }
  }

  protected getDistance(): number {
    if (this.shuttle.x < this.landingStart) {
      return this.shuttle.x - this.landingStart;
    } else if (this.shuttle.x <= this.landingEnd) {
      return 0;
    } else {
      return this.shuttle.x - this.landingEnd;
    }
  }

  protected shouldKeepAltitude(): boolean {
    return this.shuttle.y - this.landingHeight < 600 && Math.abs(this.getDistance()) > 1200;
  }

  protected getRotation(): number {
    if (this.shouldKeepAltitude() && this.shuttle.horizontalSpeed !== 0) {
      console.error('shouldKeepAltitude');
      return 0;
    }

    let angleSpeedCompensation = 0;
    let angleDistanceCompensation = Math.round(this.getDistance() * (3 / 185));
    angleDistanceCompensation += Math.round(angleDistanceCompensation / 0.67);

    if (Math.abs(this.shuttle.horizontalSpeed) > 7 && this.shuttle.y > this.landingHeight + 100) {
      angleSpeedCompensation += Math.round(this.shuttle.horizontalSpeed * (9 / 24.7));
      angleSpeedCompensation += Math.floor(angleSpeedCompensation / 0.7);
    }

    console.error('angleSpeedCompensation:', angleSpeedCompensation);
    console.error('angleDistanceCompensation:', angleDistanceCompensation);

    return Math.round(
      Math.max(
        -Game.MAX_ANGLE,
        Math.min(Game.MAX_ANGLE, angleDistanceCompensation + angleSpeedCompensation),
      ),
    );
  }

  protected getPower(): number {
    if (this.shouldKeepAltitude() && this.shuttle.verticalSpeed < -1) {
      console.error('shouldKeepAltitude');
      return 4;
    }

    if (
      this.getDistance() === 0
      && this.shuttle.rotation === 0
      && this.shuttle.y - this.landingHeight < 123
      && this.shuttle.verticalSpeed > -30
    ) {
      console.error('power off');
      return 0;
    }

    const horizontalSpeedCompensation
      = (this.shuttle.rotation < 0 && this.shuttle.horizontalSpeed < 0)
        || (this.shuttle.rotation > 0 && this.shuttle.horizontalSpeed > 0)
        ? Math.abs(Math.round(this.shuttle.horizontalSpeed / 15))
        : 0;
    const verticalSpeedCompensation = -1 * Math.round(this.shuttle.verticalSpeed / 6.6);

    console.error('horizontalSpeedCompensation:', horizontalSpeedCompensation);
    console.error('verticalSpeedCompensation:', verticalSpeedCompensation);

    return Math.min(horizontalSpeedCompensation + verticalSpeedCompensation, Game.MAX_POWER);
  }
}

const game = new Game();
while (true) {
  game.initTurn();
  game.turn();
}
