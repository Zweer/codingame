import { Point } from './point';
import { ItemPart } from './types';

export class Item extends Point {
  parts: ItemPart[];

  constructor(
    readonly x: number,
    readonly y: number,
    readonly index: number,
    itemString: string,
  ) {
    super(x, y);
    this.parts = itemString.split('-') as ItemPart[];
  }

  toString(): string {
    return `${this.index} - ${this.x} ${this.y} - ${this.parts.join('-')}`;
  }
}
