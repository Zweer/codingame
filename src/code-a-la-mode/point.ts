export class Point {
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
