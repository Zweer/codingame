class Quadrilateral {
    name: string = '';
    points: Point[] = [];
    vectors: Vector[] = [];

    constructor(input: string) {
        const inputs = input.split(' ');
        for (let i = 0, tot = inputs.length; i < tot; i) {
            this.name = `${this.name}${inputs[i++]}`;
            this.points.push(new Point(parseInt(inputs[i++], 10), parseInt(inputs[i++], 10)));
        }

        this.vectors.push(new Vector(this.points[0], this.points[1]));
        this.vectors.push(new Vector(this.points[1], this.points[2]));
        this.vectors.push(new Vector(this.points[2], this.points[3]));
        this.vectors.push(new Vector(this.points[3], this.points[0]));
    }

    debug(): void {
        console.error(`${this.name}:`);
        this.points.forEach(point => console.error(` (${point.x}, ${point.y})`));
    }

    solve() {
        const isRectangle = this.isRectangle();
        const isRhombus = this.isRhombus();

        if (isRectangle && isRhombus) {
            this.print('square');
        } else if (isRectangle) {
            this.print('rectangle');
        } else if (isRhombus) {
            this.print('rhombus');
        } else if (this.isParallelogram()) {
            this.print('parallelogram');
        } else {
            this.print('quadrilateral');
        }
    }

    isRectangle(): boolean {
        return this.vectors[0].isPerpendicular(this.vectors[1])
          && this.vectors[1].isPerpendicular(this.vectors[2])
          && this.vectors[2].isPerpendicular(this.vectors[3])
          && this.vectors[3].isPerpendicular(this.vectors[0]);
    }

    isRhombus(): boolean {
        const ab = this.points[0].lengthSquared(this.points[1]);
        const bc = this.points[1].lengthSquared(this.points[2]);
        const cd = this.points[2].lengthSquared(this.points[3]);
        const da = this.points[3].lengthSquared(this.points[0]);

        return ab === bc && bc === cd && cd === da && da === ab;
    }

    isParallelogram(): boolean {
        return this.vectors[0].isParallel(this.vectors[2]) && this.vectors[1].isParallel(this.vectors[3]);
    }

    print(nature: string): void {
        console.log(`${this.name} is a ${nature}.`);
    }
}

class Vector {
    public readonly x: number;
    public readonly y: number;

    constructor(point1: Point, point2: Point) {
        this.x = point2.x - point1.x;
        this.y = point2.y - point1.y;
    }

    isParallel(vector: Vector): boolean {
        return (this.x * vector.y) - (this.y * vector.x) === 0;
    }

    isPerpendicular(vector: Vector): boolean {
        return (this.x * vector.x) + (this.y * vector.y) === 0;
    }
}

class Point {
    constructor(public readonly x: number, public readonly y: number) {}

    lengthSquared(point: Point): number {
        return (this.x - point.x) ** 2 + (this.y - point.y) ** 2;
    }
}

class Game {
    quadrilaterals: Quadrilateral[] = [];

    constructor() {
        const count = parseInt(readline(), 10);

        for (let i = 0; i < count; i++) {
            const quadrilateral = new Quadrilateral(readline())
            quadrilateral.debug();
            this.quadrilaterals.push(quadrilateral);
        }
    }

    solve() {
        this.quadrilaterals.forEach(quadrilateral => quadrilateral.solve());
    }
}

new Game().solve();
