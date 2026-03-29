/**
 * Bring data on patient samples from the diagnosis machine to the laboratory with enough molecules to produce medicine!
 **/

declare function readline(): string; // Assuming a readline function is available

enum MoleculeType {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
}

enum Carrier {
  Player = 0,
  Opponent = 1,
  Cloud = -1,
}

enum ModuleType {
  Start = 'START_POS',
  Diagnosis = 'DIAGNOSIS',
  Molecules = 'MOLECULES',
  Laboratory = 'LABORATORY',
}

class Project {
  molecules: Record<MoleculeType, number>;

  constructor(
    public id: number,
    input: string,
  ) {
    const inputs = input.split(' ');

    this.molecules = {
      [MoleculeType.A]: parseInt(inputs[0], 10),
      [MoleculeType.B]: parseInt(inputs[1], 10),
      [MoleculeType.C]: parseInt(inputs[2], 10),
      [MoleculeType.D]: parseInt(inputs[3], 10),
      [MoleculeType.E]: parseInt(inputs[4], 10),
    };
  }

  toString(): string {
    return `Project "${this.id}"
  ${Object.values(this.molecules).join(' - ')}`;
  }
}

class Player {
  target: ModuleType = ModuleType.Start;
  eta = 0;
  score = 0;

  storage: Record<MoleculeType, number> = {
    [MoleculeType.A]: 0,
    [MoleculeType.B]: 0,
    [MoleculeType.C]: 0,
    [MoleculeType.D]: 0,
    [MoleculeType.E]: 0,
  };

  expertise: Record<MoleculeType, number> = {
    [MoleculeType.A]: 0,
    [MoleculeType.B]: 0,
    [MoleculeType.C]: 0,
    [MoleculeType.D]: 0,
    [MoleculeType.E]: 0,
  };

  constructor(public name: string) {}

  update(input: string) {
    const inputs: string[] = input.split(' ');

    this.target = inputs[0] as ModuleType;
    this.eta = parseInt(inputs[1], 10);
    this.score = parseInt(inputs[2], 10);

    this.storage = {
      [MoleculeType.A]: parseInt(inputs[3], 10),
      [MoleculeType.B]: parseInt(inputs[4], 10),
      [MoleculeType.C]: parseInt(inputs[5], 10),
      [MoleculeType.D]: parseInt(inputs[6], 10),
      [MoleculeType.E]: parseInt(inputs[7], 10),
    };

    this.expertise = {
      [MoleculeType.A]: parseInt(inputs[8], 10),
      [MoleculeType.B]: parseInt(inputs[9], 10),
      [MoleculeType.C]: parseInt(inputs[10], 10),
      [MoleculeType.D]: parseInt(inputs[11], 10),
      [MoleculeType.E]: parseInt(inputs[12], 10),
    };
  }

  toString(): string {
    return `Player "${this.name}"
  ${this.target} - ${this.eta} - ${this.score}
  ${Object.values(this.storage).join(' - ')}
  ${Object.values(this.expertise).join(' - ')}`;
  }

  goto(module: ModuleType): boolean {
    if (this.target === module) {
      return false;
    }

    console.log(`GOTO ${module}`);
    return true;
  }

  connect(what: number): void {
    console.log(`CONNECT ${what}`);
  }
}

class Sample {
  id: number;
  carriedBy: Carrier;
  rank: number;
  gain: string;
  health: number;
  cost: Record<MoleculeType, number>;

  constructor(input: string) {
    const inputs: string[] = input.split(' ');

    this.id = parseInt(inputs[0], 10);
    this.carriedBy = parseInt(inputs[1], 10) as Carrier;
    this.rank = parseInt(inputs[2], 10);
    this.gain = inputs[3];
    this.health = parseInt(inputs[4], 10);

    this.cost = {
      [MoleculeType.A]: parseInt(inputs[5], 10),
      [MoleculeType.B]: parseInt(inputs[6], 10),
      [MoleculeType.C]: parseInt(inputs[7], 10),
      [MoleculeType.D]: parseInt(inputs[8], 10),
      [MoleculeType.E]: parseInt(inputs[9], 10),
    };
  }

  toString(): string {
    return `Sample "${this.id}"
  ${this.carriedBy} - ${this.rank} - ${this.gain} - ${this.health}
  ${Object.values(this.cost).join(' - ')}`;
  }
}

class Game {
  projects: Project[] = [];
  player: Player;
  opponent: Player;

  available: Record<MoleculeType, number> = {
    [MoleculeType.A]: 0,
    [MoleculeType.B]: 0,
    [MoleculeType.C]: 0,
    [MoleculeType.D]: 0,
    [MoleculeType.E]: 0,
  };

  best: Sample | null = null;
  samples: Sample[] = [];

  constructor() {
    const projectCount: number = parseInt(readline(), 10);
    console.error('projectCount', projectCount);

    for (let i = 0; i < projectCount; i++) {
      const project = new Project(i, readline());
      console.error(project.toString());
      this.projects.push(project);
    }

    this.player = new Player('Zweer');
    this.opponent = new Player('Opponent');
  }

  turnInit() {
    this.player.update(readline());
    console.error(this.player.toString());
    this.opponent.update(readline());
    console.error(this.opponent.toString());

    const inputs: string[] = readline().split(' ');
    this.available = {
      [MoleculeType.A]: parseInt(inputs[0], 10),
      [MoleculeType.B]: parseInt(inputs[1], 10),
      [MoleculeType.C]: parseInt(inputs[2], 10),
      [MoleculeType.D]: parseInt(inputs[3], 10),
      [MoleculeType.E]: parseInt(inputs[4], 10),
    };

    console.error('available:', Object.values(this.available).join(' - '));

    const sampleCount: number = parseInt(readline(), 10);
    console.error('sampleCount', sampleCount);
    for (let i = 0; i < sampleCount; i++) {
      const sample = new Sample(readline());
      console.error(sample.toString());
      this.samples.push(sample);
    }
  }

  turn() {
    if (!this.best) {
      this.best = this.findBestSample();
      if (this.player.goto(ModuleType.Diagnosis)) {
        return;
      }
    }

    if (this.best.carriedBy === Carrier.Cloud) {
      this.player.connect(this.best.id);
      return;
    }

    if (this.samplesReady()) {

    } else {
      this.player.
    }
  }

  private findBestSample(): Sample {
    const availableSamples = this.samples.filter((sample) => sample.carriedBy === Carrier.Cloud);
    const sortedSamples = availableSamples.sort((sampleA, sampleB) => {
      return sampleA.health - sampleB.health;
    });
    console.error(sortedSamples[0].toString());
    console.error(sortedSamples[1].toString());

    return sortedSamples[0];
  }

  private samplesReady(): boolean {
    return Object.entries(this.best!.cost).every(
      ([moleculeType, cost]) => this.player.storage[moleculeType as MoleculeType] >= cost,
    );
  }
}

const game = new Game();
while (true) {
  game.turnInit();
  game.turn();
}
