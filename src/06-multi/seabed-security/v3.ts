class Vector {
  constructor(
    readonly x: number,
    readonly y: number,
  ) {}

  toString(): string {
    return `${this.x} ${this.y}`;
  }

  add(vector: Vector): Vector {
    return new Vector(this.x + vector.x, this.y + vector.y);
  }

  sub(vector: Vector): Vector {
    return new Vector(this.x - vector.x, this.y - vector.y);
  }

  multiply(value: number): Vector {
    return new Vector(this.x * value, this.y * value);
  }

  divide(value: number): Vector {
    return new Vector(this.x / value, this.y / value);
  }

  length(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  unit(): Vector {
    const length = this.length();
    return length === 0 ? new Vector(0, 0) : this.divide(length);
  }
}

class Fish {

}
