/* eslint-disable no-negated-condition */
/* eslint-disable no-lonely-if */
// Constants
enum ItemType {
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
type Item = ItemType[];

enum TileType {
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

let textCounter = 0;
const lyrics = [
  '♫ Never gonna',
  'give you up',
  'let you down',
  'run around',
  'and desert you',
  '♫ Never gonna',
  'make you cry',
  'say goodbye',
  'tell a lie',
  'and hurt you',
  '♫ ♪ ♫ ♪',
];

const insults = [
  'My gran could do better',
  "And she's dead!",
  '♪ ☺',
  'What are you?',
  'An idiot sandwich?',
  '♪ ☺',
  "I wish you'd jump",
  'in the oven',
  'That would make my life',
  'A lot easier!',
  '♪ ☺',
  'Congratulations..',
  'on the worst dish',
  'in this competition',
  'so far!',
  '♪ ☺',
];

const isDebug = true;
function debug(string: string): void {
  if (isDebug) {
    console.error(`DEBUG: ${string}`);
  }
}

const showWaiting = true;
const showTableItems = true;
const showActiveOrder = true;
const showOven = true;

class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}

  get coords(): string {
    return `${this.x} ${this.y}`;
  }

  getDistance(point: Point): number {
    return Math.sqrt((this.x - point.x) ** 2 + (this.y - point.y) ** 2);
  }

  isAroundCoords(point: Point): boolean {
    return Math.abs(point.x - this.x) <= 1 && Math.abs(point.y - this.y) <= 1;
  }
}

class Chef extends Point {
  item: Item;
  actionState: string;
  waitingBake = false;
  targetCommand: Item;
  repeatedCmds = 0;

  constructor(
    public x: number,
    public y: number,
    readonly name: string,
    item: string,
  ) {
    super(x, y);
    this.name = name;
    this.item = item.split('-') as Item;
  }

  update(x: number, y: number, item: string): void {
    this.x = x;
    this.y = y;
    this.item = item.split('-') as Item;
  }

  showItems(): void {
    console.error(`${this.name}: ${this.item.join(' & ')}`);
  }

  hasAllItems(): boolean {
    if (!this.targetCommand) {
      return false;
    }

    return this.targetCommand.every((ingr) => this.item.includes(ingr));
  }

  isAround(target: TileType, direction?: TileType, shouldBeEmpty?: boolean): Point | null {
    let searchRangeX: number[] = [-1, 0, 1];
    let searchRangeY: number[] = [-1, 0, 1];

    if (direction) {
      const coords = Kitchen.getCoords(direction);
      if (coords.x <= this.x) {
        searchRangeX = [1, 0, -1];
      }
      if (coords.y >= this.y) {
        searchRangeY = [1, 0, -1];
      }
    }

    for (const iy of searchRangeY) {
      for (const ix of searchRangeX) {
        const lookX = this.x + ix;
        const lookY = this.y + iy;
        if (Kitchen.map[lookY][lookX] === target) {
          const point = new Point(lookX, lookY);
          if (!shouldBeEmpty || !TableItem.getItemAtCoords(point)) {
            return point;
          }
        }
      }
    }

    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class Kitchen {
  static map: string[][] = [];
  static initials: Partial<Record<ItemType, TileType>> = {
    [ItemType.Dish]: TileType.Dish,
    [ItemType.IceCream]: TileType.IceCream,
    [ItemType.Blueberries]: TileType.Blueberries,
    [ItemType.Strawberries]: TileType.Strawberries,
    [ItemType.ChoppingBoard]: TileType.ChoppingBoard,
    [ItemType.Oven]: TileType.Oven,
    [ItemType.Dough]: TileType.Dough,
    [ItemType.Window]: TileType.Window,
  };

  static addLineToMap(line: string): void {
    Kitchen.map.push(line.split(''));
  }

  static showMap(): void {
    for (const line of Kitchen.map) {
      console.error(line.join('-'));
    }
  }

  static getCoords(target: TileType): Point {
    for (let index = 0; index < Kitchen.map.length; index++) {
      const line = Kitchen.map[index];
      if (line.includes(target)) {
        return new Point(line.indexOf(target), index);
      }
    }

    throw new Error(`COORDS NOT FOUND (${target})`);
  }
}

class Customer {
  static index = 0;
  static customers: Customer[] = [];
  static waiting: Customer[] = [];

  static showAllCustomers(): void {
    for (const cus of Customer.customers) {
      console.error(cus.toString());
    }
  }

  static showWaitingCustomers(): void {
    for (const cus of Customer.waiting) {
      console.error(cus.toString());
    }
  }

  static getBestOrderItem(turnsRemaining: number): Item | null {
    let best: Customer;
    let award = 0;
    let nbActions = 99;

    debug(`remaining turns: ${turnsRemaining}`);

    for (const cus of Customer.waiting) {
      debug(cus.toString());
      debug(`(${cus.id}) weight: ${cus.weight} | relativeAward: ${cus.relativeAward}`);
      if (turnsRemaining < 80) {
        if (cus.weight < nbActions) {
          nbActions = cus.weight;
          best = cus;
        }
      } else {
        if (cus.relativeAward > award) {
          award = cus.relativeAward;
          best = cus;
        }
      }
    }

    debug(best.toString());

    return best.item;
  }

  item: Item;
  id: number;

  constructor(
    item: string,
    readonly award: number,
  ) {
    this.item = item.split('-') as Item;
    if (false) {
      this.item = this.item.sort((ingrA, ingrB) => {
        if (ingrA === ItemType.ChoppedStrawberries) {
          return -1;
        } else if (ingrB === ItemType.ChoppedStrawberries) {
          return 1;
        } else if (ingrA === ItemType.Croissant) {
          return -1;
        } else if (ingrB === ItemType.Croissant) {
          return 1;
        } else if (ingrA === ItemType.Tart) {
          return -1;
        } else if (ingrB === ItemType.Tart) {
          return 1;
        } else {
          return ingrA.localeCompare(ingrB);
        }
      });
    }
    this.id = Customer.index;
    Customer.index += 1;
  }

  get weight(): number {
    let weight = 0;

    if (this.item.includes(ItemType.Tart)) {
      weight += TableItem.hasItem(ItemType.Tart) ? 2 : 8;
    }
    if (this.item.includes(ItemType.Croissant)) {
      weight += TableItem.hasItem(ItemType.Croissant) ? 2 : 6;
    }
    if (this.item.includes(ItemType.ChoppedStrawberries)) {
      weight += TableItem.hasItem(ItemType.ChoppedStrawberries) ? 2 : 3;
    }
    if (this.item.includes(ItemType.IceCream)) {
      weight += 1;
    }
    if (this.item.includes(ItemType.Blueberries)) {
      weight += 1;
    }

    if (
      !this.item.includes(ItemType.Tart) &&
      !this.item.includes(ItemType.Croissant) &&
      !this.item.includes(ItemType.ChoppedStrawberries) &&
      !this.item.includes(ItemType.IceCream) &&
      !this.item.includes(ItemType.Blueberries)
    ) {
      throw new Error('Customer with unknown item');
    }

    return weight;
  }

  get relativeAward(): number {
    return parseFloat((this.award / this.weight).toFixed(2));
  }

  toString(): string {
    return `(${this.id}) item:${this.item.join('-')} / award:${this.award}`;
  }
}

class TableItem extends Point {
  static table: TableItem[] = [];

  static showAllItems(): void {
    for (let index = 0; index < TableItem.table.length; index++) {
      const item = TableItem.table[index];
      console.error(`${index} - ${item.x} ${item.y} ${item.item}`);
    }
  }

  static getItemAtCoords(point: Point): Item | null {
    return TableItem.table.find((tableItem) => tableItem.x === point.x && tableItem.y === point.y)
      ?.item;
  }

  static getItem(item: ItemType): TableItem | undefined {
    return TableItem.table.find(
      (tableItem) => tableItem.item.includes(item) && tableItem.item.length === 1,
    );
  }

  static hasItem(item: ItemType): boolean {
    return Boolean(TableItem.getItem(item));
  }

  static getItemCoords(item: ItemType): Point | string {
    return TableItem.getItem(item) ?? `NO ITEM FOUND (${item})`;
  }

  static dishIsCompatible(target: Item, order?: Item, except?: ItemType): boolean {
    if (target.length > (order ? order.length : 0)) {
      return false;
    }

    if (!target || !order) {
      return false;
    }

    if (!target.includes(ItemType.Dish)) {
      return false;
    }

    if (except && target.includes(except)) {
      return false;
    }

    for (const it of target) {
      if (!order.includes(it)) {
        return false;
      }
    }

    return true;
  }

  static findMostCompatibleDish(item?: Item, except?: ItemType): TableItem | null {
    let nbItems = 0;
    let dish: TableItem | null = null;
    if (!item) {
      return null;
    }

    for (const tableItem of TableItem.table) {
      if (
        tableItem.item.includes(ItemType.Dish) &&
        TableItem.dishIsCompatible(tableItem.item, item, except)
      ) {
        if (tableItem.item.length > nbItems) {
          nbItems = tableItem.item.length;
          dish = tableItem;
        }
      }
    }

    return dish;
  }

  item: Item;

  constructor(
    readonly x: number,
    readonly y: number,
    items: string,
  ) {
    super(x, y);
    this.item = items.split('-') as Item;
  }
}

declare function readline(): string; // Assuming a readline function is available

class Game {
  readonly myChef = new Chef(99, 99, 'Zweer', '');
  readonly partnerChef = new Chef(99, 99, 'Partner', '');
  readonly oldAction = ['', ''];

  turnsRemaining: number;
  ovenContent: Item;
  ovenTimer: number;
  processCompatibleDish: TableItem;

  constructor() {
    const numAllCustomers = parseInt(readline(), 10);
    for (let i = 0; i < numAllCustomers; i++) {
      const [customerItem, customerAwardStr] = readline().split(' ');
      const customerAward = parseInt(customerAwardStr, 10);
      const newCustomer = new Customer(customerItem, customerAward);
      Customer.customers.push(newCustomer);
    }

    for (let i = 0; i < 7; i++) {
      Kitchen.addLineToMap(readline());
    }
  }

  initTurn() {
    this.turnsRemaining = parseInt(readline(), 10);

    const [playerXstr, playerYstr, playerItem] = readline().split(' ');
    const playerX = parseInt(playerXstr, 10);
    const playerY = parseInt(playerYstr, 10);
    this.myChef.update(playerX, playerY, playerItem);

    const [partnerXstr, partnerYstr, partnerItem] = readline().split(' ');
    const partnerX = parseInt(partnerXstr, 10);
    const partnerY = parseInt(partnerYstr, 10);
    this.partnerChef.update(partnerX, partnerY, partnerItem);

    const numTablesWithItems = parseInt(readline(), 10);
    TableItem.table = [];
    for (let i = 0; i < numTablesWithItems; i++) {
      const [tableXstr, tableYstr, item] = readline().split(' ');
      const tableX = parseInt(tableXstr, 10);
      const tableY = parseInt(tableYstr, 10);
      const tableItem = new TableItem(tableX, tableY, item);
      TableItem.table.push(tableItem);
    }

    if (showTableItems) {
      console.error('Items:');
      TableItem.showAllItems();
    }

    const [ovenContentsStr, ovenTimerStr] = readline().split(' ');
    this.ovenTimer = parseInt(ovenTimerStr, 10);
    this.ovenContent = ovenContentsStr.split('-') as Item;

    const numCustomers = parseInt(readline(), 10);
    Customer.waiting = [];
    for (let i = 0; i < numCustomers; i++) {
      const [customerItem, customerAwardStr] = readline().split(' ');
      const customerAward = parseInt(customerAwardStr, 10);
      const newCustomer = new Customer(customerItem, customerAward);
      Customer.waiting.push(newCustomer);
    }

    if (showWaiting) {
      console.error('Waiting:');
      Customer.showWaitingCustomers();
    }

    if (showOven) {
      console.error(`Oven (${this.ovenTimer}):`);
      console.error(this.ovenContent.join('-'));
    }

    if (showTableItems) {
      for (const tableItem of TableItem.table) {
        if (tableItem.item.includes(ItemType.Dish)) {
          debug(
            `GetAllDishes: ${tableItem.item.join(' & ')}: comp=${TableItem.dishIsCompatible(
              tableItem.item,
              this.myChef.targetCommand,
            )}`,
          );
        }
      }
    }

    this.myChef.showItems();
  }

  turn() {
    let nextAction = 'WAIT';

    console.error('actionState:', this.myChef.actionState);
    console.error('targetCommand:', this.myChef.targetCommand?.join('-'));

    if (!this.myChef.actionState) {
      if (this.myChef.targetCommand) {
        let myOrderStillAvailable = false;
        for (const ord of Customer.waiting) {
          if (TableItem.dishIsCompatible(this.myChef.targetCommand, ord.item)) {
            this.myChef.targetCommand = ord.item;
            myOrderStillAvailable = true;
          }
        }

        if (!myOrderStillAvailable) {
          this.myChef.targetCommand = null;
        }
      }

      if (!this.myChef.targetCommand) {
        this.myChef.targetCommand = Customer.getBestOrderItem(this.turnsRemaining);
      }
    }

    if (showActiveOrder) {
      console.error(
        `My Active Order: ${
          this.myChef.targetCommand ? this.myChef.targetCommand.join('-') : 'None'
        }`,
      );
    }

    const canDrop = this.dropDish();

    if (this.myChef.hasAllItems()) {
      nextAction = this.use(TileType.Window);
    } else {
      const compatibleDish = TableItem.findMostCompatibleDish(this.myChef.targetCommand);

      if (!this.myChef.actionState) {
        if (
          !this.myChef.item.includes(ItemType.Dish) &&
          compatibleDish &&
          this.myChef.item.length < compatibleDish.item.length
        ) {
          console.error('Found comp dish! :)');
          nextAction = this.useCoords(compatibleDish);
        } else if (
          !this.myChef.item.includes(ItemType.None) &&
          !TableItem.dishIsCompatible(this.myChef.item, this.myChef.targetCommand) &&
          canDrop
        ) {
          console.error('Action : Not compatible! Dropping dish...');
          nextAction = canDrop;
        } else if (
          this.myChef.item.includes(ItemType.Dish) &&
          compatibleDish &&
          compatibleDish.item.length > this.myChef.item.length
        ) {
          console.error('Part Compatible dish');
          if (canDrop) {
            nextAction = canDrop;
          }
        } else {
          const processedFoods = [ItemType.Tart, ItemType.Croissant, ItemType.ChoppedStrawberries];

          if (this.myChef.targetCommand) {
            for (const orderPart of this.myChef.targetCommand) {
              if (!this.myChef.item.includes(orderPart)) {
                if (!processedFoods.includes(orderPart)) {
                  if (this.myChef.item.includes(ItemType.None)) {
                    if (compatibleDish) {
                      nextAction = this.useCoords(compatibleDish);
                    } else {
                      nextAction = this.use(TileType.Dish);
                    }
                  } else {
                    nextAction = this.use(Kitchen.initials[orderPart]);
                  }
                } else {
                  if (TableItem.hasItem(orderPart)) {
                    const coords = TableItem.getItemCoords(orderPart);
                    if (typeof coords !== 'string') {
                      if (TableItem.getItemAtCoords(coords)?.includes(ItemType.Dish)) {
                        if (canDrop) {
                          nextAction = canDrop;
                        }
                      } else {
                        nextAction = this.useCoords(coords);
                      }
                    }
                  } else {
                    this.myChef.actionState = `process_${orderPart}`;
                    break;
                  }
                }
              }
            }
          }
        }
      } else {
        // Processing logic
        if (this.myChef.actionState === `process_${ItemType.Tart}`) {
          // PROCESSING TART
          this.processCompatibleDish = TableItem.findMostCompatibleDish(
            this.myChef.targetCommand,
            ItemType.Tart,
          );

          if (
            this.myChef.item.includes(ItemType.Dish) &&
            !this.myChef.item.includes(ItemType.Tart) &&
            canDrop &&
            !this.myChef.waitingBake
          ) {
            nextAction = canDrop!;
          } else if (this.myChef.item.includes(ItemType.Dough)) {
            nextAction = this.use(TileType.ChoppingBoard);
          } else if (this.myChef.item.includes(ItemType.ChoppedDough)) {
            nextAction = this.use(TileType.Blueberries);
          } else if (
            (this.myChef.item.includes(ItemType.RawTart) ||
              this.ovenContent.includes(ItemType.RawTart) ||
              this.ovenContent.includes(ItemType.Tart)) &&
            !this.myChef.item.includes(ItemType.Tart)
          ) {
            if (this.myChef.item.includes(ItemType.RawTart)) {
              if (
                this.ovenContent.includes(ItemType.Tart) ||
                (this.ovenContent.includes(ItemType.RawTart) &&
                  this.ovenTimer < 3 &&
                  !this.partnerChef.isAround(TileType.Oven))
              ) {
                nextAction = canDrop!;
              } else {
                nextAction = this.use(TileType.Oven);
              }
            } else {
              nextAction = this.bakeIt(ItemType.RawTart, ItemType.Tart);
            }
          } else if (this.myChef.item.includes(ItemType.Tart)) {
            this.myChef.waitingBake = false;
            if (this.myChef.item.includes(ItemType.Dish)) {
              this.myChef.actionState = null;
            } else if (this.processCompatibleDish) {
              nextAction = this.useCoords(this.processCompatibleDish);
              if (this.myChef.isAroundCoords(this.processCompatibleDish)) {
                this.myChef.actionState = null;
              }
            } else {
              nextAction = this.use(TileType.Dish);
              if (this.myChef.isAround(TileType.Dish)) {
                this.myChef.actionState = null;
              }
            }
          } else {
            const ingredients = [
              ItemType.Tart,
              ItemType.RawTart,
              ItemType.ChoppedDough,
              ItemType.Dough,
            ];
            for (const ingr of ingredients) {
              if (TableItem.hasItem(ingr)) {
                const coords = TableItem.getItemCoords(ingr);
                if (typeof coords !== 'string') {
                  if (!TableItem.getItemAtCoords(coords)?.includes(ItemType.Dish)) {
                    nextAction = this.useCoords(coords);
                    break;
                  }
                }
              } else {
                nextAction = this.use(TileType.Dough);
              }
            }
          }
        } else if (this.myChef.actionState === `process_${ItemType.Croissant}`) {
          // PROCESSING CROISSANT
          this.processCompatibleDish = TableItem.findMostCompatibleDish(
            this.myChef.targetCommand,
            ItemType.Croissant,
          );

          if (
            this.myChef.item.includes(ItemType.Dish) &&
            !this.myChef.item.includes(ItemType.Croissant) &&
            canDrop &&
            !this.myChef.waitingBake
          ) {
            nextAction = canDrop!;
          } else if (
            (this.myChef.item.includes(ItemType.Dough) ||
              this.ovenContent.includes(ItemType.Dough) ||
              this.ovenContent.includes(ItemType.Croissant)) &&
            !this.myChef.item.includes(ItemType.Croissant)
          ) {
            if (this.myChef.item.includes(ItemType.Dough)) {
              if (
                this.ovenContent.includes(ItemType.Croissant) ||
                (this.ovenContent.includes(ItemType.Dough) &&
                  this.ovenTimer < 3 &&
                  !this.partnerChef.isAround(TileType.Oven))
              ) {
                nextAction = canDrop!;
              } else {
                nextAction = this.use(TileType.Oven);
              }
            } else {
              nextAction = this.bakeIt(ItemType.Dough, ItemType.Croissant);
            }
          } else if (this.myChef.item.includes(ItemType.Croissant)) {
            this.myChef.waitingBake = false;
            if (this.myChef.item.includes(ItemType.Dish)) {
              this.myChef.actionState = null;
            } else if (this.processCompatibleDish) {
              nextAction = this.useCoords(this.processCompatibleDish);
              if (this.myChef.isAroundCoords(this.processCompatibleDish)) {
                this.myChef.actionState = null;
              }
            } else {
              nextAction = this.use(TileType.Dish);
              if (this.myChef.isAround(TileType.Dish)) {
                this.myChef.actionState = null;
              }
            }
          } else {
            const ingredients = [ItemType.Croissant, ItemType.Dough];
            for (const ingr of ingredients) {
              if (TableItem.hasItem(ingr)) {
                const coords = TableItem.getItemCoords(ingr);
                if (typeof coords !== 'string') {
                  if (!TableItem.getItemAtCoords(coords)?.includes(ItemType.Dish)) {
                    nextAction = this.useCoords(coords);
                    break;
                  }
                }
              } else {
                nextAction = this.use(TileType.Dough);
              }
            }
          }
        } else if (this.myChef.actionState === `process_${ItemType.ChoppedStrawberries}`) {
          // PROCESSING CHOPPED_STRAWBERRIES
          this.processCompatibleDish = TableItem.findMostCompatibleDish(
            this.myChef.targetCommand,
            ItemType.ChoppedStrawberries,
          );

          if (
            this.myChef.item.includes(ItemType.Dish) &&
            !this.myChef.item.includes(ItemType.ChoppedStrawberries) &&
            canDrop
          ) {
            nextAction = canDrop!;
          } else if (this.myChef.item.includes(ItemType.Strawberries)) {
            nextAction = this.use(TileType.ChoppingBoard);
          } else if (
            this.myChef.item.includes(ItemType.ChoppedStrawberries) &&
            !this.myChef.item.includes(ItemType.Dish)
          ) {
            if (this.processCompatibleDish) {
              nextAction = this.useCoords(this.processCompatibleDish);
              if (this.myChef.isAroundCoords(this.processCompatibleDish)) {
                this.myChef.actionState = null;
              }
            } else {
              nextAction = this.use(TileType.Dish);
              if (this.myChef.isAround(TileType.Dish)) {
                this.myChef.actionState = null;
              }
            }
          } else {
            const ingredients = [ItemType.ChoppedStrawberries, ItemType.Strawberries];
            for (const ingr of ingredients) {
              if (TableItem.hasItem(ingr)) {
                const coords = TableItem.getItemCoords(ingr);
                if (typeof coords !== 'string') {
                  if (!TableItem.getItemAtCoords(coords)?.includes(ItemType.Dish)) {
                    nextAction = this.useCoords(coords);
                    break;
                  }
                }
              } else {
                nextAction = this.use(TileType.Strawberries);
              }
            }
          }
        } else {
          nextAction = 'ERROR IN PROCESSING CHOICE';
        }
      }
    }

    if (nextAction === this.oldAction[0] || nextAction === this.oldAction[1]) {
      this.myChef.repeatedCmds += 1;
    } else {
      this.oldAction[0] = this.oldAction[1];
      this.oldAction[1] = nextAction;
      this.myChef.repeatedCmds = 0;
    }

    debug(this.oldAction.join(', '));
    debug(this.myChef.repeatedCmds.toString());

    if (this.myChef.repeatedCmds >= 20) {
      console.log(`${this.oldAction[0]}; WTF is this loop...`);
    } else {
      console.log(`${nextAction}; ${insults[textCounter]}`);
    }

    textCounter += 1;
    if (textCounter > insults.length - 1) {
      textCounter = 0;
    }
  }

  followPartner(target: Point): string | null {
    debug(`Test1 ${this.myChef.x} ${this.partnerChef.x} ${target.x}`);
    if (this.myChef.x <= this.partnerChef.x && this.partnerChef.x <= target.x) {
      if (this.myChef.y <= this.partnerChef.y && this.partnerChef.y <= target.y) {
        return `MOVE ${this.partnerChef.coords}`;
      }
    }

    if (this.myChef.x >= this.partnerChef.x && this.partnerChef.x >= target.x) {
      if (this.myChef.y >= this.partnerChef.y && this.partnerChef.y >= target.y) {
        return `MOVE ${this.partnerChef.coords}`;
      }
    }
    return null;
  }

  use(target: TileType): string {
    const followPartner = false;
    if (followPartner) {
      const followCommand = this.followPartner(Kitchen.getCoords(target));
      if (followCommand) {
        return followCommand;
      }
    }
    return `USE ${Kitchen.getCoords(target).coords}`;
  }

  useCoords(target: Point): string {
    const followPartner = false;
    if (followPartner) {
      const followCommand = this.followPartner(target);
      if (followCommand) {
        return followCommand;
      }
    }
    return `USE ${target.coords}`;
  }

  move(target: TileType): string {
    return `MOVE ${Kitchen.getCoords(target).coords}`;
  }

  bakeIt(ingr: ItemType, result: ItemType): string {
    this.myChef.waitingBake = true;
    if (
      (this.ovenContent.includes(ingr) ||
        (this.ovenContent.includes(result) && this.ovenTimer >= 4)) &&
      this.myChef.item.includes(ItemType.None) &&
      !this.partnerChef.isAround(TileType.Oven)
    ) {
      if (this.processCompatibleDish) {
        return this.useCoords(this.processCompatibleDish);
      } else {
        return this.use(TileType.Dish);
      }
    } else {
      return this.use(TileType.Oven);
    }
  }

  dropDish(): string | null {
    const searchTable = this.myChef.isAround(TileType.Table, null, true);
    if (searchTable) {
      return this.useCoords(searchTable);
    }

    return null;
  }
}

const game = new Game();
while (true) {
  game.initTurn();
  game.turn();
}
