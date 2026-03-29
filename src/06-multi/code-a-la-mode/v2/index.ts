declare function readline(): string; // Assuming a readline function is available

enum ItemPart {
  None = 'NONE',
  Dish = 'DISH',
  Blueberries = 'BLUEBERRIES',
  IceCream = 'ICE_CREAM',
  Strawberries = 'STRAWBERRIES',
  ChoppedStrawberries = 'CHOPPED_STRAWBERRIES',
  ChoppingBoard = 'CHOPPING_BOARD',
  Oven = 'OVEN',
  Dough = 'DOUGH',
  Croissant = 'CROISSANT',
  ChoppedDough = 'CHOPPED_DOUGH',
  RawTart = 'RAW_TART',
  Tart = 'TART',
  Window = 'WINDOW',
}

enum Equipment {
  Table = '#',
  Empty = '.',
  Dish = 'D',
  IceCream = 'I',
  Blueberries = 'B',
  Strawberries = 'S',
  ChoppingBoard = 'C',
  Oven = 'O',
  Dough = 'H',
  Window = 'W',
}

class Position {
  constructor(
    public x: number,
    public y: number,
  ) {}

  isNear(target: Position): boolean {
    return Math.abs(this.x - target.x) <= 1 && Math.abs(this.y - target.y) <= 1;
  }

  getDistance(target: Position): number {
    return Math.sqrt((this.x - target.x) ** 2 + (this.y - target.y) ** 2);
  }

  getManhattanDistance(target: Position): number {
    return Math.abs(this.x - target.x) + Math.abs(this.y - target.y);
  }

  toString(): string {
    return `${this.x} ${this.y}`;
  }
}

class Item {
  parts: ItemPart[];

  constructor(item: string) {
    this.parts = item.split('-') as ItemPart[];
  }

  isSimple(): boolean {
    return this.parts.length === 1;
  }

  has(part: ItemPart): boolean {
    return this.parts.includes(part);
  }

  is(...parts: ItemPart[]): boolean {
    return this.parts.every(part => parts.includes(part));
  }

  isEmpty(): boolean {
    return this.parts.length === 0 || this.is(ItemPart.None);
  }

  toString(): string {
    return this.parts.join('-');
  }
}

class Table {
  position: Position;
  item?: Item;

  constructor(
    x: number,
    y: number,
    readonly equipment: Equipment,
  ) {
    this.position = new Position(x, y);
  }

  update(item: string): void {
    this.item = new Item(item);
  }

  toString(): string {
    return `(${this.position}) [${this.equipment}] ${this.item}`;
  }

  use(): void {
    console.log(`USE ${this.position}`);
  }
}

class Chef {
  position: Position;
  item: Item;

  constructor(
    readonly name: string,
    x: number,
    y: number,
    item: string,
  ) {
    this.position = new Position(x, y);
    this.item = new Item(item);
  }

  update(x: number, y: number, item: string): void {
    this.position = new Position(x, y);
    this.item = new Item(item);
  }

  toString(): string {
    return `Chef: ${this.name} (${this.position}) ${this.item}`;
  }
}

class Customer {
  item: Item;

  constructor(
    readonly index: number,
    item: string,
    readonly score: number,
    readonly tables?: Table[],
  ) {
    this.item = new Item(item);
  }

  toString(): string {
    const index = this.index.toString().padStart(2, '0');
    const score = this.score.toString().padStart(4, '0');

    return `${index}: (${score}) [${this.weight}] ${this.item}`;
  }

  get weight(): number {
    let weight = 0;

    if (this.tables) {
      if (this.item.has(ItemPart.Tart)) {
        weight += this.tables.some(table => table.item?.has(ItemPart.Tart)) ? 2 : 8;
      }
      if (this.item.has(ItemPart.Croissant)) {
        weight += this.tables.some(table => table.item?.has(ItemPart.Croissant)) ? 2 : 6;
      }
      if (this.item.has(ItemPart.ChoppedStrawberries)) {
        weight += this.tables.some(table => table.item?.has(ItemPart.ChoppedStrawberries))
          ? 2
          : 3;
      }
      if (this.item.has(ItemPart.IceCream)) {
        weight += 1;
      }
      if (this.item.has(ItemPart.Blueberries)) {
        weight += 1;
      }
    }

    return weight;
  }

  get weightedScore(): number {
    return this.score / this.weight;
  }
}

class Game {
  static KITCHEN_ROWS = 7;
  static KITCHEN_COLS = 11;

  static DEBUG_CUSTOMERS = true;
  static DEBUG_TABLE = true;
  static DEBUG_CHEF = true;
  static DEBUG_OVEN = true;

  player = new Chef('Zweer', Infinity, Infinity, ItemPart.None);
  partner = new Chef('Partner', Infinity, Infinity, ItemPart.None);

  layout: string[] = [];
  tables: Table[] = [];
  customers: Customer[] = [];
  queue: Customer[] = [];
  crates: Partial<Record<ItemPart, Table>> = {};

  ovenContent = new Item(ItemPart.None);
  ovenTimer = Infinity;

  turnsRemaining = Infinity;

  constructor() {
    const numAllCustomers = Number.parseInt(readline(), 10);
    for (let i = 0; i < numAllCustomers; i++) {
      const [customerItem, customerAwardStr] = readline().split(' ');
      const customerAward = Number.parseInt(customerAwardStr, 10);
      this.customers.push(new Customer(i, customerItem, customerAward));
    }

    if (Game.DEBUG_CUSTOMERS) {
      console.error('Customers:');
      for (const customer of this.customers) {
        console.error(`  ${customer}`);
      }
    }

    for (let y = 0; y < Game.KITCHEN_ROWS; y++) {
      const layoutRow = readline();
      this.layout.push(layoutRow);
    }

    if (Game.DEBUG_TABLE) {
      console.error('Layout:');
      for (const row of this.layout) {
        console.error(`  ${row}`);
      }
    }
  }

  initTurn() {
    this.turnsRemaining = Number.parseInt(readline(), 10);

    const [playerXstr, playerYstr, playerItem] = readline().split(' ');
    const playerX = Number.parseInt(playerXstr, 10);
    const playerY = Number.parseInt(playerYstr, 10);
    this.player.update(playerX, playerY, playerItem);
    if (Game.DEBUG_CHEF) {
      console.error(`${this.player}`);
    }

    const [partnerXstr, partnerYstr, partnerItem] = readline().split(' ');
    const partnerX = Number.parseInt(partnerXstr, 10);
    const partnerY = Number.parseInt(partnerYstr, 10);
    this.partner.update(partnerX, partnerY, partnerItem);
    if (Game.DEBUG_CHEF) {
      console.error(`${this.partner}`);
    }

    this.tables = this.layout
      .map((row, y) => row.split('').map((equip, x) => ({ equip, x, y })))
      .flat()
      .filter(({ equip }) => equip !== Equipment.Empty)
      .map(({ equip, x, y }) => new Table(x, y, equip as Equipment));

    const numTablesWithItems = Number.parseInt(readline(), 10);
    for (let i = 0; i < numTablesWithItems; i++) {
      const [tableXstr, tableYstr, item] = readline().split(' ');
      const tableX = Number.parseInt(tableXstr, 10);
      const tableY = Number.parseInt(tableYstr, 10);
      this.tables
        .find(table => table.position.x === tableX && table.position.y === tableY)!
        .update(item);
    }
    if (Game.DEBUG_TABLE) {
      console.error('Tables:');
      for (const table of this.tables) {
        console.error(`  ${table}`);
        // console.error(
        //   `    ${this.player.isCompatible(table.item) ? 'COMPATIBLE!!!!' : 'not compatible'}`,
        // );
      }
    }

    const [ovenContentsStr, ovenTimerStr] = readline().split(' ');
    this.ovenTimer = Number.parseInt(ovenTimerStr, 10);
    this.ovenContent = new Item(ovenContentsStr);
    if (Game.DEBUG_OVEN) {
      console.error(`Oven (${this.ovenTimer}):`);
      console.error(`  ${this.ovenContent}`);
    }

    const numCustomers = Number.parseInt(readline(), 10);
    this.queue = [];
    for (let i = 0; i < numCustomers; i++) {
      const [customerItem, customerAwardStr] = readline().split(' ');
      const customerAward = Number.parseInt(customerAwardStr, 10);
      const newCustomer = new Customer(i, customerItem, customerAward, this.tables);
      this.queue.push(newCustomer);
    }

    if (Game.DEBUG_CUSTOMERS) {
      console.error('Queue:');
      for (const customer of this.queue) {
        console.error(`  ${customer}`);
      }
    }
  }

  turn(): void {
    this.crates = {
      [ItemPart.Blueberries]: this.findEquipment(Equipment.Blueberries),
      [ItemPart.IceCream]: this.findEquipment(Equipment.IceCream),
      [ItemPart.Dough]: this.findEquipment(Equipment.Dough),
      [ItemPart.Strawberries]: this.findEquipment(Equipment.Strawberries),
    };

    // 0. If the oven has something ready, go get it!
    if ([ItemPart.Croissant, ItemPart.Tart].some(part => this.ovenContent.is(part))) {
      if (this.player.item.isEmpty()) {
        return this.findEquipment(Equipment.Oven).use();
      }
    }

    const orderedQueue = this.queue.sort(
      (customerA, customerB) => customerA.weightedScore - customerB.weightedScore,
    );
    const best = orderedQueue[0];
    if (Game.DEBUG_CUSTOMERS) {
      console.error('Queue:');
      for (const customer of orderedQueue) {
        console.error(`  ${customer}`);
      }

      console.error('Best:');
      console.error(`  ${best}`);
    }

    // 1. if we're holding a plate, grab missing items from tables and such.
    // If one is missing, drop the plate
    if (this.player.item.has(ItemPart.Dish)) {
      console.error('We are carrying a plate');

      // if it has anything we don't need, dishwasher it
      if (this.player.item.parts.some(part => !best.item.has(part))) {
        return this.findEquipment(Equipment.Dish).use();
      }

      const missingParts = best.item.parts.filter(part => !this.player.item.has(part));
      if (missingParts.length === 0) {
        return this.findEquipment(Equipment.Window).use();
      }

      const missingPart = missingParts[0];
      console.error(`Missing part: ${missingPart}`);

      if (this.crates[missingPart]) {
        const crate = this.crates[missingPart];
        console.error(`Using crate: ${crate}`);
        return crate.use();
      } else {
        const table = this.tables.find(table => table.item?.is(missingPart));
        return table ? table.use() : this.findEmptyTable().use();
      }
    }

    // 2. Build missing items. If all items are built, grab an empty plate.
    for (const missingPart of best.item.parts) {
      if (this.isReady(missingPart)) {
        continue;
      }

      switch (missingPart) {
        case ItemPart.Croissant:
          return this.buildCroissant();

        case ItemPart.Tart:
          return this.buildTart();

        case ItemPart.ChoppedStrawberries:
          return this.buildChoppedStrawberries();

        default:
          throw new Error(`Unrecognized missingPart: "${missingPart}"`);
      }

      // 3. if we're holding something we shouldn't, put it down.
      if (this.player.item) {
        return this.findEmptyTable().use();
      }

      return (
        this.tables.find(table => table.item?.is(ItemPart.Dish))
        ?? this.findEquipment(Equipment.Dish)
      ).use();
    }
  }

  findEquipment(equipment: Equipment): Table {
    return this.tables.find(table => table.equipment === equipment)!;
  }

  findEmptyTable(): Table {
    const emptyTables = this.tables
      .filter(table => table.equipment === Equipment.Empty && !table.item)
      .sort(
        (tableA, tableB) =>
          this.player.position.getManhattanDistance(tableA.position)
          - this.player.position.getManhattanDistance(tableB.position),
      );

    if (Game.DEBUG_TABLE) {
      console.error('Empty tables:');
      for (const table of emptyTables) {
        console.error(`  ${table}`);
      }
    }

    return emptyTables[0];
  }

  isReady(part: ItemPart): boolean {
    return (
      Object.keys(this.crates).includes(part)
      || this.tables.some(table => table.item?.is(part))
      || (part === ItemPart.Croissant
        && [ItemPart.Croissant, ItemPart.Dough].some(ovenPart => this.ovenContent.is(ovenPart)))
    );
  }

  buildCroissant(): void {
    if (!this.player.item) {
      return this.findEquipment(Equipment.Dough).use();
    } else if (this.player.item.is(ItemPart.Dough)) {
      return this.findEquipment(Equipment.Oven).use();
    } else {
      return this.findEmptyTable().use();
    }
  }

  buildTart(): void {}

  buildChoppedStrawberries(): void {
    if (!this.player.item) {
      return this.findEquipment(Equipment.Strawberries).use();
    } else if (this.player.item.is(ItemPart.Strawberries)) {
      return this.findEquipment(Equipment.ChoppingBoard).use();
    } else {
      return this.findEmptyTable().use();
    }
  }
}

const game = new Game();
while (true) {
  game.initTurn();
  game.turn();
}
