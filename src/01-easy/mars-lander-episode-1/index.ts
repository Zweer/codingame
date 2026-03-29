interface Point {
  x: number;
  y: number;
}

class Game {
  static MARS_GRAVITY = 3.711;
  static FLAT_GROUND_WIDTH = 1000;
  static LANDING_MAX_VERTICAL_SPEED = -40;
  static LANDING_MAX_HORIZONTAL_SPEED = 20;

  points: Point[] = [];

  constructor() {
    const surfacePoints = Number.parseInt(readline(), 10);
    for (let i = 0; i < surfacePoints; i += 1) {
      const [x, y] = readline()
        .split(' ')
        .map(input => Number.parseInt(input, 10));
      this.points.push({ x, y });
    }
  }

  turn() {
    const [x, y, hSpeed, vSpeed, fuel, rotate, power] = readline()
      .split(' ')
      .map(input => Number.parseInt(input, 10));

    console.error('fuel:', fuel);

    const angle = 0;
    let thrust = 0;

    if (vSpeed < Game.LANDING_MAX_VERTICAL_SPEED + Game.MARS_GRAVITY) {
      thrust = Math.ceil(Game.MARS_GRAVITY);
    }

    console.log(`${angle} ${thrust}`);
  }
}

const game = new Game();
while (true) {
  game.turn();
}
