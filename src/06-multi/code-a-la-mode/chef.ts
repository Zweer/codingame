import type { ItemPart, TileType } from './types';
import { Point } from './point';

export class Chef extends Point {
  item: ItemPart[];
  actionState?: string;
  waitingBake = false;
  targetCommand?: ItemPart[];
  repeatedCmds = 0;

  constructor(
    public x: number,
    public y: number,
    readonly name: string,
    item: string,
  ) {
    super(x, y);
    this.name = name;
    this.item = item.split('-') as ItemPart[];
  }

  update(x: number, y: number, item: string): void {
    this.x = x;
    this.y = y;
    this.item = item.split('-') as ItemPart[];
  }

  showItems(): void {
    console.error(`${this.name}: ${this.item.join(' & ')}`);
  }

  hasAllItems(): boolean {
    if (!this.targetCommand) {
      return false;
    }

    return this.targetCommand.every(ingr => this.item.includes(ingr));
  }

  isAround(target: TileType, direction?: TileType, shouldBeEmpty?: boolean): Point | null {
    let searchRangeX = [-1, 0, 1];
    let searchRangeY = [-1, 0, 1];

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

  isCompatible(parts: ItemPart[], excepts?: ItemPart): boolean {
    if (!this.targetCommand) {
      return false;
    }

    if (excepts && parts.includes(excepts)) {
      return false;
    }

    return parts.every(part => this.targetCommand!.includes(part));
  }
}
