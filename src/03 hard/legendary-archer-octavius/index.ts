// Define UFO structure
interface UFO {
    id: number;
    x: number;
    y: number;
    z: number;
}

// Define possible configurations for Octavius
enum Config {
    TowerA_Normal = 0,
    TowerB_Normal = 1,
    TowerB_Milkshake = 2,
}

// Define the state for Dijkstra's algorithm
class State {
    constructor(
        public time: number,
        public mask: number, // Bitmask of shot UFOs
        public config: Config
    ) {}
}

// Priority Queue for Dijkstra
// Implemented as a min-heap
class PriorityQueue<T> {
    private heap: T[] = [];
    private comparator: (a: T, b: T) => number;

    constructor(comparator: (a: T, b: T) => number) {
        this.comparator = comparator;
    }

    push(item: T): void {
        this.heap.push(item);
        this.bubbleUp();
    }

    pop(): T | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        const min = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.sinkDown();
        }
        return min;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private bubbleUp(): void {
        let index = this.heap.length - 1;
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.comparator(this.heap[index], this.heap[parentIndex]) < 0) {
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    private sinkDown(): void {
        let index = 0;
        const length = this.heap.length;
        const element = this.heap[0];

        while (true) {
            const leftChildIndex = 2 * index + 1;
            const rightChildIndex = 2 * index + 2;
            let leftChild: T | undefined, rightChild: T | undefined;
            let swap: number | null = null;

            if (leftChildIndex < length) {
                leftChild = this.heap[leftChildIndex];
                if (this.comparator(leftChild, element) < 0) {
                    swap = leftChildIndex;
                }
            }

            if (rightChildIndex < length) {
                rightChild = this.heap[rightChildIndex];
                // If right child exists and is smaller than current element
                // AND (if left child exists, right child is smaller than left child OR left child does not exist)
                if (
                    (swap === null && this.comparator(rightChild, element) < 0) ||
                    (swap !== null && this.comparator(rightChild, leftChild!) < 0)
                ) {
                    swap = rightChildIndex;
                }
            }

            if (swap === null) {
                break;
            }
            [this.heap[index], this.heap[swap]] = [this.heap[swap], this.heap[index]];
            index = swap;
        }
    }
}

// Main solve function
function solve() {
    const N: number = parseInt(readline());
    const ufos: UFO[] = [];
    for (let i = 0; i < N; i++) {
        const [x, y, z] = readline().split(' ').map(Number);
        ufos.push({ id: i, x, y, z });
    }

    // Constants for positions and physics
    const TOWER_A_POS = { x: 0, y: 80, z: 0 };
    const TOWER_B_POS = { x: 200, y: 20, z: 0 };
    const G = 9.8; // Magnitude of gravity
    const AY = -G; // y-component of acceleration due to gravity

    // Constants for bow types
    const DRAW_TIME_NORMAL = 3; // seconds
    const INITIAL_SPEED_NORMAL = 60; // m/s

    const DRAW_TIME_MILKSHAKE = 2; // seconds
    const INITIAL_SPEED_MILKSHAKE = 80; // m/s

    // Constants for transitions
    const TRAVEL_TIME = 20; // seconds to Tower B
    const MILKSHAKE_TIME = 8; // seconds to drink milkshake

    /**
     * Calculates the flight time for an arrow to hit a target.
     * @param x0, y0, z0 - Shooter's coordinates.
     * @param xf, yf, zf - Target UFO's coordinates.
     * @param initialSpeed - Initial speed of the arrow.
     * @returns The minimum flight time, or Infinity if unreachable (shouldn't happen per problem).
     */
    function getFlightTime(
        x0: number, y0: number, z0: number,
        xf: number, yf: number, zf: number,
        initialSpeed: number
    ): number {
        const dx = xf - x0;
        const dy = yf - y0;
        const dz = zf - z0;

        const A = 0.25 * AY * AY;
        const B = -initialSpeed * initialSpeed - dy * AY;
        const C = dx * dx + dy * dy + dz * dz;

        const discriminant = B * B - 4 * A * C;

        // Using a small epsilon for robustness against floating point inaccuracies.
        // Problem guarantees all UFOs are possible to hit, so discriminant should be non-negative.
        if (discriminant < -1e-9) { 
            return Infinity; 
        }

        const sqrtDiscriminant = Math.sqrt(Math.max(0, discriminant));

        const t_sq1 = (-B + sqrtDiscriminant) / (2 * A);
        const t_sq2 = (-B - sqrtDiscriminant) / (2 * A);

        let min_t_flight = Infinity;

        // Consider only positive real roots for t_flight^2
        if (t_sq1 >= -1e-9) { // Check if positive or very close to zero
            min_t_flight = Math.min(min_t_flight, Math.sqrt(Math.max(0, t_sq1)));
        }
        if (t_sq2 >= -1e-9) { // Check if positive or very close to zero
            min_t_flight = Math.min(min_t_flight, Math.sqrt(Math.max(0, t_sq2)));
        }
        return min_t_flight;
    }

    // Precompute flight times for each UFO from each configuration.
    // flightTimes[ufo_id][config_id]
    const flightTimes: number[][] = Array(N).fill(0).map(() => Array(3).fill(0));

    for (let i = 0; i < N; i++) {
        const ufo = ufos[i];
        flightTimes[i][Config.TowerA_Normal] = getFlightTime(
            TOWER_A_POS.x, TOWER_A_POS.y, TOWER_A_POS.z,
            ufo.x, ufo.y, ufo.z,
            INITIAL_SPEED_NORMAL
        );

        flightTimes[i][Config.TowerB_Normal] = getFlightTime(
            TOWER_B_POS.x, TOWER_B_POS.y, TOWER_B_POS.z,
            ufo.x, ufo.y, ufo.z,
            INITIAL_SPEED_NORMAL
        );

        flightTimes[i][Config.TowerB_Milkshake] = getFlightTime(
            TOWER_B_POS.x, TOWER_B_POS.y, TOWER_B_POS.z,
            ufo.x, ufo.y, ufo.z,
            INITIAL_SPEED_MILKSHAKE
        );
    }

    // DP table: minTime[mask][config] = minimum time to reach this state.
    const MAX_MASK = 1 << N;
    // Using a 2D array for minTime: rows for mask, columns for config (0, 1, 2)
    const minTime: number[][] = Array(MAX_MASK).fill(0).map(() => Array(3).fill(Infinity));

    // Priority queue for Dijkstra's algorithm. States are ordered by 'time'.
    const pq = new PriorityQueue<State>((a, b) => a.time - b.time);

    // Initial state: 0 UFOs shot, at Tower A, Normal Bow, time 0
    minTime[0][Config.TowerA_Normal] = 0;
    pq.push(new State(0, 0, Config.TowerA_Normal));

    let minTotalTime = Infinity; // To store the final answer

    while (!pq.isEmpty()) {
        const { time, mask, config } = pq.pop()!;

        // If we found a shorter path to this state already, skip.
        if (time > minTime[mask][config]) {
            continue;
        }

        // If all UFOs are shot, update the overall minimum time.
        if (mask === MAX_MASK - 1) {
            minTotalTime = Math.min(minTotalTime, time);
            continue; // No further actions needed from this state.
        }

        // Option 1: Shoot an unshot UFO
        for (let i = 0; i < N; i++) {
            if (!((mask >> i) & 1)) { // If UFO 'i' is not yet shot
                let shootDrawTime: number;

                if (config === Config.TowerA_Normal) {
                    shootDrawTime = DRAW_TIME_NORMAL;
                } else if (config === Config.TowerB_Normal) {
                    shootDrawTime = DRAW_TIME_NORMAL;
                } else { // Config.TowerB_Milkshake
                    shootDrawTime = DRAW_TIME_MILKSHAKE;
                }
                
                // Total time for this shot = draw time + flight time
                const shotCost = shootDrawTime + flightTimes[i][config];

                const newMask = mask | (1 << i);
                const newTime = time + shotCost;

                // If this path is shorter, update minTime and push to PQ
                if (newTime < minTime[newMask][config]) {
                    minTime[newMask][config] = newTime;
                    pq.push(new State(newTime, newMask, config));
                }
            }
        }

        // Option 2: Transition capabilities (travel or drink milkshake)
        if (config === Config.TowerA_Normal) {
            // Travel to Tower B (Normal Bow)
            const newTime = time + TRAVEL_TIME;
            const newConfig = Config.TowerB_Normal;
            if (newTime < minTime[mask][newConfig]) {
                minTime[mask][newConfig] = newTime;
                pq.push(new State(newTime, mask, newConfig));
            }
        } else if (config === Config.TowerB_Normal) {
            // Drink Milkshake (at Tower B)
            const newTime = time + MILKSHAKE_TIME;
            const newConfig = Config.TowerB_Milkshake;
            if (newTime < minTime[mask][newConfig]) {
                minTime[mask][newConfig] = newTime;
                pq.push(new State(newTime, mask, newConfig));
            }
        }
    }

    // The result is the minimum time found for the state where all UFOs are shot (mask = MAX_MASK - 1).
    // It's already correctly updated in minTotalTime within the loop.
    console.log(minTotalTime.toFixed(2));
}