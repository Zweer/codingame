/**
 * Reads a line of input from stdin. In a CodinGame environment, this function is usually provided.
 * For local testing, you might need to mock it or provide a test input string.
 * @returns {string} The read line.
 */
declare function readline(): string;

class Game {
    nums: number[] = [];

    constructor() {
        const [a, b] = readline().split(' ').map(Number);
        this.nums.push(Math.max(a, b));
        this.nums.push(Math.min(a, b));

        console.log(`${this.nums[0]} * ${this.nums[1]}`);
    }

    solve() {
        while (this.nums[1] > 0) {
            if (this.nums[1] % 2 === 0) {
                this.nums[0] *= 2;
                this.nums[1] /= 2;
            } else {
                this.nums[1] -= 1;
                this.nums.push(this.nums[0]);
            }

            console.log(`= ${this.nums[0]} * ${this.nums[1]}${this.nums.slice(2).map(n => ` + ${n}`).join('')}`);
        }

        console.log(`= ${this.nums[0] * this.nums[1] + this.nums.slice(2).reduce((sum, num) => sum + num, 0)}`);
    }
}

new Game().solve();
