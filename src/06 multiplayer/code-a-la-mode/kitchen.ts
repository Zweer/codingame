import type { Item } from './item';
import type { TileType } from './types';
import { Point } from './point';

export class Kitchen {
  readonly map: TileType[][] = [];

  items: Item[] = [];

  addLineToMap(line: string): void {
    this.map.push(line.split('') as TileType[]);
  }

  getCoords(target: TileType): Point {
    for (let index = 0; index < this.map.length; index++) {
      const line = this.map[index];
      if (line.includes(target)) {
        return new Point(line.indexOf(target), index);
      }
    }

    throw new Error(`COORDS NOT FOUND (${target})`);
  }
}
