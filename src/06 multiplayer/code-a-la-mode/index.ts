import { Chef } from './chef';
import { insults, lyrics } from './constants';
import { Customer } from './customer';
import { Item } from './item';
import { Kitchen } from './kitchen';
import { Point } from './point';
import { ItemPart, TileType } from './types';
import { debug } from './utils';

declare function readline(): string; // Assuming a readline function is available

const useInsults = true;
const phrases = useInsults ? insults : lyrics;

let textCounter = 0;

const showCustomers = true;
const showWaiting = true;
const showTableItems = true;
const showActiveOrder = true;
const showOven = true;

class TableItemAAAA extends Point {
  static table: TableItem[] = [];

  static getItem(item: ItemPart): TableItem | undefined {
    return TableItem.table.find(
      (tableItem) => tableItem.item.includes(item) && tableItem.item.length === 1,
    );
  }

  static hasItem(item: ItemPart): boolean {
    return Boolean(TableItem.getItem(item));
  }

  static getItemCoords(item: ItemPart): Point | string {
    return TableItem.getItem(item) ?? `NO ITEM FOUND (${item})`;
  }

  static findMostCompatibleDish(item?: ItemString, except?: ItemPart): TableItem | null {
    let nbItems = 0;
    let dish: TableItem | null = null;
    if (!item) {
      return null;
    }

    for (const tableItem of TableItem.table) {
      if (
        tableItem.item.includes(ItemPart.Dish) &&
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

  item: ItemString;

  constructor(
    readonly x: number,
    readonly y: number,
    items: string,
  ) {
    super(x, y);
    this.item = items.split('-') as ItemString;
  }
}

class Game {
  readonly customers: Customer[] = [];
  waiting: Customer[] = [];

  readonly kitchen = new Kitchen();
  readonly myChef = new Chef(99, 99, 'Zweer', '');
  readonly partnerChef = new Chef(99, 99, 'Partner', '');
  readonly oldAction = ['', ''];

  turnsRemaining = Infinity;
  ovenContent: ItemPart[] = [];
  ovenTimer = NaN;
  processCompatibleDish: TableItem;

  constructor() {
    const numAllCustomers = parseInt(readline(), 10);
    for (let i = 0; i < numAllCustomers; i++) {
      const [customerItem, customerAwardStr] = readline().split(' ');
      const customerAward = parseInt(customerAwardStr, 10);
      this.customers.push(new Customer(customerItem, customerAward));
    }

    if (showCustomers) {
      console.error('Customers:');
      for (const customer of this.customers) {
        console.error(`  ${customer.toString()}`);
      }
    }

    for (let i = 0; i < 7; i++) {
      this.kitchen.addLineToMap(readline());
    }
  }

  initTurn() {
    this.turnsRemaining = parseInt(readline(), 10);

    const [playerXstr, playerYstr, playerItem] = readline().split(' ');
    const playerX = parseInt(playerXstr, 10);
    const playerY = parseInt(playerYstr, 10);
    this.myChef.update(playerX, playerY, playerItem);
    this.myChef.showItems();

    const [partnerXstr, partnerYstr, partnerItem] = readline().split(' ');
    const partnerX = parseInt(partnerXstr, 10);
    const partnerY = parseInt(partnerYstr, 10);
    this.partnerChef.update(partnerX, partnerY, partnerItem);
    this.partnerChef.showItems();

    const numTablesWithItems = parseInt(readline(), 10);
    this.kitchen.items = [];
    for (let i = 0; i < numTablesWithItems; i++) {
      const [tableXstr, tableYstr, item] = readline().split(' ');
      const tableX = parseInt(tableXstr, 10);
      const tableY = parseInt(tableYstr, 10);
      const tableItem = new Item(tableX, tableY, i, item);
      this.kitchen.items.push(tableItem);
    }

    const [ovenContentsStr, ovenTimerStr] = readline().split(' ');
    this.ovenTimer = parseInt(ovenTimerStr, 10);
    this.ovenContent = ovenContentsStr.split('-') as ItemPart[];

    const numCustomers = parseInt(readline(), 10);
    this.waiting = [];
    for (let i = 0; i < numCustomers; i++) {
      const [customerItem, customerAwardStr] = readline().split(' ');
      const customerAward = parseInt(customerAwardStr, 10);
      const newCustomer = new Customer(customerItem, customerAward);
      this.waiting.push(newCustomer);
    }

    if (showWaiting) {
      console.error('Waiting:');
      for (const customer of this.waiting) {
        console.error(`  ${customer.toString()}`);
      }
    }

    if (showOven) {
      console.error(`Oven (${this.ovenTimer}):`);
      console.error(`  ${this.ovenContent.join('-')}`);
    }

    if (showTableItems) {
      console.error('Items:');
      for (const item of this.kitchen.items) {
        console.error(`  ${item.toString()}`);
        console.error(
          `    ${this.myChef.isCompatible(item.parts) ? 'COMPATIBLE!!!!' : 'not compatible'}`,
        );
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
          !this.myChef.item.includes(ItemPart.Dish) &&
          compatibleDish &&
          this.myChef.item.length < compatibleDish.item.length
        ) {
          console.error('Found comp dish! :)');
          nextAction = this.useCoords(compatibleDish);
        } else if (
          !this.myChef.item.includes(ItemPart.None) &&
          !TableItem.dishIsCompatible(this.myChef.item, this.myChef.targetCommand) &&
          canDrop
        ) {
          console.error('Action : Not compatible! Dropping dish...');
          nextAction = canDrop;
        } else if (
          this.myChef.item.includes(ItemPart.Dish) &&
          compatibleDish &&
          compatibleDish.item.length > this.myChef.item.length
        ) {
          console.error('Part Compatible dish');
          if (canDrop) {
            nextAction = canDrop;
          }
        } else {
          const processedFoods = [ItemPart.Tart, ItemPart.Croissant, ItemPart.ChoppedStrawberries];

          if (this.myChef.targetCommand) {
            for (const orderPart of this.myChef.targetCommand) {
              if (!this.myChef.item.includes(orderPart)) {
                if (!processedFoods.includes(orderPart)) {
                  if (this.myChef.item.includes(ItemPart.None)) {
                    if (compatibleDish) {
                      nextAction = this.useCoords(compatibleDish);
                    } else {
                      nextAction = this.use(TileType.Dish);
                    }
                  } else {
                    nextAction = this.use(Kitchen.initials[orderPart]);
                  }
                } else if (TableItem.hasItem(orderPart)) {
                  const coords = TableItem.getItemCoords(orderPart);
                  if (typeof coords !== 'string') {
                    if (TableItem.getItemAtCoords(coords)?.includes(ItemPart.Dish)) {
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
      } else {
        // Processing logic
        if (this.myChef.actionState === `process_${ItemPart.Tart}`) {
          // PROCESSING TART
          this.processCompatibleDish = TableItem.findMostCompatibleDish(
            this.myChef.targetCommand,
            ItemPart.Tart,
          );

          if (
            this.myChef.item.includes(ItemPart.Dish) &&
            !this.myChef.item.includes(ItemPart.Tart) &&
            canDrop &&
            !this.myChef.waitingBake
          ) {
            nextAction = canDrop!;
          } else if (this.myChef.item.includes(ItemPart.Dough)) {
            nextAction = this.use(TileType.ChoppingBoard);
          } else if (this.myChef.item.includes(ItemPart.ChoppedDough)) {
            nextAction = this.use(TileType.Blueberries);
          } else if (
            (this.myChef.item.includes(ItemPart.RawTart) ||
              this.ovenContent.includes(ItemPart.RawTart) ||
              this.ovenContent.includes(ItemPart.Tart)) &&
            !this.myChef.item.includes(ItemPart.Tart)
          ) {
            if (this.myChef.item.includes(ItemPart.RawTart)) {
              if (
                this.ovenContent.includes(ItemPart.Tart) ||
                (this.ovenContent.includes(ItemPart.RawTart) &&
                  this.ovenTimer < 3 &&
                  !this.partnerChef.isAround(TileType.Oven))
              ) {
                nextAction = canDrop!;
              } else {
                nextAction = this.use(TileType.Oven);
              }
            } else {
              nextAction = this.bakeIt(ItemPart.RawTart, ItemPart.Tart);
            }
          } else if (this.myChef.item.includes(ItemPart.Tart)) {
            this.myChef.waitingBake = false;
            if (this.myChef.item.includes(ItemPart.Dish)) {
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
              ItemPart.Tart,
              ItemPart.RawTart,
              ItemPart.ChoppedDough,
              ItemPart.Dough,
            ];
            for (const ingr of ingredients) {
              if (TableItem.hasItem(ingr)) {
                const coords = TableItem.getItemCoords(ingr);
                if (typeof coords !== 'string') {
                  if (!TableItem.getItemAtCoords(coords)?.includes(ItemPart.Dish)) {
                    nextAction = this.useCoords(coords);
                    break;
                  }
                }
              } else {
                nextAction = this.use(TileType.Dough);
              }
            }
          }
        } else if (this.myChef.actionState === `process_${ItemPart.Croissant}`) {
          // PROCESSING CROISSANT
          this.processCompatibleDish = TableItem.findMostCompatibleDish(
            this.myChef.targetCommand,
            ItemPart.Croissant,
          );

          if (
            this.myChef.item.includes(ItemPart.Dish) &&
            !this.myChef.item.includes(ItemPart.Croissant) &&
            canDrop &&
            !this.myChef.waitingBake
          ) {
            nextAction = canDrop!;
          } else if (
            (this.myChef.item.includes(ItemPart.Dough) ||
              this.ovenContent.includes(ItemPart.Dough) ||
              this.ovenContent.includes(ItemPart.Croissant)) &&
            !this.myChef.item.includes(ItemPart.Croissant)
          ) {
            if (this.myChef.item.includes(ItemPart.Dough)) {
              if (
                this.ovenContent.includes(ItemPart.Croissant) ||
                (this.ovenContent.includes(ItemPart.Dough) &&
                  this.ovenTimer < 3 &&
                  !this.partnerChef.isAround(TileType.Oven))
              ) {
                nextAction = canDrop!;
              } else {
                nextAction = this.use(TileType.Oven);
              }
            } else {
              nextAction = this.bakeIt(ItemPart.Dough, ItemPart.Croissant);
            }
          } else if (this.myChef.item.includes(ItemPart.Croissant)) {
            this.myChef.waitingBake = false;
            if (this.myChef.item.includes(ItemPart.Dish)) {
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
            const ingredients = [ItemPart.Croissant, ItemPart.Dough];
            for (const ingr of ingredients) {
              if (TableItem.hasItem(ingr)) {
                const coords = TableItem.getItemCoords(ingr);
                if (typeof coords !== 'string') {
                  if (!TableItem.getItemAtCoords(coords)?.includes(ItemPart.Dish)) {
                    nextAction = this.useCoords(coords);
                    break;
                  }
                }
              } else {
                nextAction = this.use(TileType.Dough);
              }
            }
          }
        } else if (this.myChef.actionState === `process_${ItemPart.ChoppedStrawberries}`) {
          // PROCESSING CHOPPED_STRAWBERRIES
          this.processCompatibleDish = TableItem.findMostCompatibleDish(
            this.myChef.targetCommand,
            ItemPart.ChoppedStrawberries,
          );

          if (
            this.myChef.item.includes(ItemPart.Dish) &&
            !this.myChef.item.includes(ItemPart.ChoppedStrawberries) &&
            canDrop
          ) {
            nextAction = canDrop!;
          } else if (this.myChef.item.includes(ItemPart.Strawberries)) {
            nextAction = this.use(TileType.ChoppingBoard);
          } else if (
            this.myChef.item.includes(ItemPart.ChoppedStrawberries) &&
            !this.myChef.item.includes(ItemPart.Dish)
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
            const ingredients = [ItemPart.ChoppedStrawberries, ItemPart.Strawberries];
            for (const ingr of ingredients) {
              if (TableItem.hasItem(ingr)) {
                const coords = TableItem.getItemCoords(ingr);
                if (typeof coords !== 'string') {
                  if (!TableItem.getItemAtCoords(coords)?.includes(ItemPart.Dish)) {
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
      console.log(`${nextAction}; ${phrases[textCounter]}`);
    }

    textCounter += 1;
    if (textCounter > phrases.length - 1) {
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

  bakeIt(ingr: ItemPart, result: ItemPart): string {
    this.myChef.waitingBake = true;
    if (
      (this.ovenContent.includes(ingr) ||
        (this.ovenContent.includes(result) && this.ovenTimer >= 4)) &&
      this.myChef.item.includes(ItemPart.None) &&
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
