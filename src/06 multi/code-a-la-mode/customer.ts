import { ItemPart } from './types';
import { debug } from './utils';

export class Customer {
  static index = 0;

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

  static getBestOrderItem(turnsRemaining: number): ItemPart[] | null {
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
      } else if (cus.relativeAward > award) {
        award = cus.relativeAward;
        best = cus;
      }
    }

    debug(best.toString());

    return best.item;
  }

  item: ItemPart[];
  id: number;

  constructor(
    item: string,
    readonly award: number,
  ) {
    this.item = item.split('-') as ItemPart[];
    if (false) {
      this.item = this.item.sort((ingrA, ingrB) => {
        if (ingrA === ItemPart.ChoppedStrawberries) {
          return -1;
        } else if (ingrB === ItemPart.ChoppedStrawberries) {
          return 1;
        } else if (ingrA === ItemPart.Croissant) {
          return -1;
        } else if (ingrB === ItemPart.Croissant) {
          return 1;
        } else if (ingrA === ItemPart.Tart) {
          return -1;
        } else if (ingrB === ItemPart.Tart) {
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

    if (this.item.includes(ItemPart.Tart)) {
      weight += TableItem.hasItem(ItemPart.Tart) ? 2 : 8;
    }
    if (this.item.includes(ItemPart.Croissant)) {
      weight += TableItem.hasItem(ItemPart.Croissant) ? 2 : 6;
    }
    if (this.item.includes(ItemPart.ChoppedStrawberries)) {
      weight += TableItem.hasItem(ItemPart.ChoppedStrawberries) ? 2 : 3;
    }
    if (this.item.includes(ItemPart.IceCream)) {
      weight += 1;
    }
    if (this.item.includes(ItemPart.Blueberries)) {
      weight += 1;
    }

    if (
      !this.item.includes(ItemPart.Tart)
      && !this.item.includes(ItemPart.Croissant)
      && !this.item.includes(ItemPart.ChoppedStrawberries)
      && !this.item.includes(ItemPart.IceCream)
      && !this.item.includes(ItemPart.Blueberries)
    ) {
      throw new Error('Customer with unknown item');
    }

    return weight;
  }

  get relativeAward(): number {
    return Number.parseFloat((this.award / this.weight).toFixed(2));
  }

  toString(): string {
    return `(${this.id}) item:${this.item.join('-')} / award:${this.award}`;
  }
}
