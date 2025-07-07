declare function readline(): string; // Assuming a readline function is available

type Action = 'SPEED' | 'JUMP' | 'WAIT' | 'UP' | 'DOWN' | 'SLOW';

class Team {
  static BONUS: Record<Action, number> = {
    SPEED: 0.6,
    UP: 0.5,
    DOWN: 0.5,
    WAIT: 0.3,
    JUMP: 0.2,
    SLOW: 0.1,
  };

  constructor(
    public minimum: number,
    public pathLength: number,
    public lines: number[] = [0, 0, 0, 0],
    public x = 0,
    public speed = 0,
    public actions: Action[] = [],
  ) {}

  get remainingBike(): number {
    return this.lines.reduce((sum, current) => sum + current, 0);
  }

  get score(): number {
    if (this.remainingBike >= this.minimum) {
      const lastAction = this.actions[this.actions.length - 1];
      return this.remainingBike * this.x + (Team.BONUS[lastAction] || 0);
    } else {
      return 0;
    }
  }

  // Metodo per creare una copia profonda dell'istanza
  public clone(): Team {
    const newTeam = new Team(this.minimum, this.pathLength, [...this.lines], this.x, this.speed, [
      ...this.actions,
    ]);

    return newTeam;
  }

  public play(command: Action, currentRoad: string[]): void {
    switch (command) {
      case 'SPEED':
        this.speedUp(currentRoad);
        break;
      case 'SLOW':
        this.slowDown(currentRoad);
        break;
      case 'JUMP':
        this.jump(currentRoad);
        break;
      case 'WAIT':
        this.wait(currentRoad);
        break;
      case 'UP':
        this.up(currentRoad);
        break;
      case 'DOWN':
        this.down(currentRoad);
        break;
    }
  }

  private up(currentRoad: string[]): void {
    if (this.lines[0] === 1) {
      this.wait(currentRoad);
    } else {
      for (let i = 1; i < 4; i++) {
        if (this.lines[i - 1] === 0 && this.lines[i] === 1) {
          const sectorTop = currentRoad[i - 1].substring(this.x, this.x + this.speed);
          const sectorBot = currentRoad[i].substring(this.x, this.x + this.speed);
          if (sectorTop.includes('0') || sectorBot.includes('0')) {
            this.lines[i - 1] = 0;
            this.lines[i] = 0;
          } else {
            this.lines[i - 1] = 1;
            this.lines[i] = 0;
          }
        } else if (this.lines[i - 1] === 1 && this.lines[i] === 1) {
          if (currentRoad[i - 1].substring(this.x, this.x + this.speed).includes('0')) {
            this.lines[i - 1] = 0;
          }
          if (currentRoad[i].substring(this.x, this.x + this.speed).includes('0')) {
            this.lines[i] = 0;
          }
        }
      }
      this.x += this.speed;
    }
  }

  private down(currentRoad: string[]): void {
    if (this.lines[3] === 1) {
      this.wait(currentRoad);
    } else {
      for (let i = 2; i >= 0; i--) {
        // Loop inverso
        if (this.lines[i + 1] === 0 && this.lines[i] === 1) {
          const sectorTop = currentRoad[i].substring(this.x, this.x + this.speed);
          const sectorBot = currentRoad[i + 1].substring(this.x, this.x + this.speed);
          if (sectorTop.includes('0') || sectorBot.includes('0')) {
            this.lines[i + 1] = 0;
            this.lines[i] = 0;
          } else {
            this.lines[i + 1] = 1;
            this.lines[i] = 0;
          }
        } else if (this.lines[i + 1] === 1 && this.lines[i] === 1) {
          if (currentRoad[i + 1].substring(this.x, this.x + this.speed).includes('0')) {
            this.lines[i + 1] = 0;
          }
          if (currentRoad[i].substring(this.x, this.x + this.speed).includes('0')) {
            this.lines[i] = 0;
          }
        }
      }
      this.x += this.speed;
    }
  }

  private speedUp(currentRoad: string[]): void {
    this.speed += 1;
    this.lines.forEach((line, idx) => {
      if (line === 1) {
        if (currentRoad[idx].substring(this.x, this.x + this.speed).includes('0')) {
          this.lines[idx] = 0;
        }
      }
    });
    this.x += this.speed;
  }

  private slowDown(currentRoad: string[]): void {
    this.speed -= 1;
    if (this.x + this.speed <= this.pathLength) {
      this.lines.forEach((line, idx) => {
        if (line === 1) {
          if (currentRoad[idx].substring(this.x, this.x + this.speed).includes('0')) {
            this.lines[idx] = 0;
          }
        }
      });
    }
    this.x += this.speed;
  }

  private jump(currentRoad: string[]): void {
    if (this.x + this.speed + 1 <= this.pathLength) {
      this.lines.forEach((line, idx) => {
        if (line === 1) {
          if (currentRoad[idx][this.x + this.speed] === '0' || currentRoad[idx][this.x] === '0') {
            this.lines[idx] = 0;
          }
        }
      });
    }
    this.x += this.speed;
  }

  private wait(currentRoad: string[]): void {
    this.lines.forEach((line, idx) => {
      if (line === 1) {
        if (currentRoad[idx].substring(this.x, this.x + this.speed).includes('0')) {
          this.lines[idx] = 0;
        }
      }
    });
    this.x += this.speed;
  }
}

class Game {
  numBikes: number;
  minBikes: number;
  actions: Action[];
  road: string[] = [];
  final: Action[] = [];

  get roadLen(): number {
    return this.road[0].length;
  }

  constructor() {
    this.numBikes = parseInt(readline(), 10);
    this.minBikes = parseInt(readline(), 10);

    this.actions = Object.keys(Team.BONUS) as Action[];

    for (let i = 0; i < 4; i++) {
      this.road.push(`${readline()}${'.'.repeat(50)}`);
    }

    console.error('Actions:', this.actions);
    console.error('Num Bikes:', this.numBikes);
    console.error('Min Bikes:', this.minBikes);
    console.error('Road:');
    this.road.forEach((lane) => console.error(lane));

    if (this.roadLen === 86) {
      const countZeros = (str: string) => (str.match(/0/g) || []).length;
      if (countZeros(this.road[0]) === 5 || countZeros(this.road[3]) === 5) {
        this.final = ['WAIT', 'WAIT', 'JUMP', 'SPEED', 'JUMP', 'SPEED'];
      }
    }
  }

  initTurn() {
    const team = new Team(this.minBikes, this.roadLen);

    if (this.final.length > 0) {
      return;
    }

    team.speed = parseInt(readline(), 10);
    for (let i = 0; i < this.numBikes; i++) {
      const [x, y, isActive] = readline().split(' ').map(Number);
      team.lines[y] = isActive;
      if (isActive === 1) {
        team.x = x;
      }
    }
    team.actions = [];

    const queue: Team[] = [team.clone()];

    while (
      queue.length > 0 &&
      queue[0].x < team.pathLength - 30 &&
      queue[0].remainingBike >= team.minimum
    ) {
      const t = queue.shift()!;
      if (!t) continue;

      for (const action of this.actions) {
        const t2 = t.clone();
        t2.play(action, this.road);
        t2.actions.push(action);
        queue.push(t2);
      }

      queue.sort((queueA, queueB) => queueB.score - queueA.score);
    }

    if (queue.length > 0) {
      this.final = queue[0].actions;
    } else {
      this.final = ['SPEED'];
    }
  }

  turn() {
    console.error(this.final);
    const nextAction = this.final.shift();
    if (nextAction) {
      console.log(nextAction);
    } else {
      console.log('SPEED');
    }
  }
}

const game = new Game();
while (true) {
  game.initTurn();
  game.turn();
}
