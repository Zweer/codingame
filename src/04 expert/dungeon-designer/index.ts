// Define global readline for CodinGame environment
declare function readline(): string;

/**
 * Computes (base^exp) % mod using modular exponentiation.
 * Handles BigInt for large numbers.
 */
function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
    let res = 1n;
    base %= mod;
    while (exp > 0n) {
        if (exp % 2n === 1n) {
            res = (res * base) % mod;
        }
        base = (base * base) % mod;
        exp /= 2n;
    }
    return res;
}

/**
 * Computes the Greatest Common Divisor (GCD) of two BigInts using the Euclidean algorithm.
 */
function gcd(a: bigint, b: bigint): bigint {
    while (b !== 0n) {
        [a, b] = [b, a % b];
    }
    return a;
}

/**
 * Computes the Least Common Multiple (LCM) of two BigInts.
 */
function lcm(a: bigint, b: bigint): bigint {
    if (a === 0n || b === 0n) return 0n;
    return (a * b) / gcd(a, b);
}

// Interface for representing a cell's coordinates
interface Cell {
    y: number;
    x: number;
}

function solve() {
    // Read maze dimensions
    const whInput = readline().split(' ').map(Number);
    const W = whInput[0];
    const H = whInput[1];

    // Read BBS parameters
    const pqrInput = readline().split(' ').map(Number);
    const P = BigInt(pqrInput[0]);
    const Q = BigInt(pqrInput[1]);
    const R = BigInt(pqrInput[2]);

    // Precompute N and lambda for BBS
    const N = P * Q;
    const lambda = lcm(P - 1n, Q - 1n);

    // Initialize mazeGrid: mazeGrid[y][x][0] for east passage, [1] for south passage
    // true = passage open, false = wall
    // Initially, all passages are open
    const mazeGrid: boolean[][][] = Array(H).fill(0).map(() => Array(W).fill(0).map(() => [true, true]));

    // Apply Blum Blum Shub to determine walls for interior cells
    // Cells (x,y) where x < W-1 AND y < H-1 are "interior" cells that toss a coin.
    for (let y = 0; y < H - 1; y++) {
        for (let x = 0; x < W - 1; x++) {
            const S = BigInt(x + y * W + 1); // Exponent base for 2^S
            const exponent = modPow(2n, S, lambda); // E = 2^S mod lambda
            const bbs_val = modPow(R, exponent, N); // R^E mod N

            if (bbs_val % 2n === 1n) { // If odd ("heads") -> build wall to the east
                mazeGrid[y][x][0] = false; // Set east passage to false (wall)
            } else { // If even ("tails") -> build wall to the south
                mazeGrid[y][x][1] = false; // Set south passage to false (wall)
            }
        }
    }

    // Helper function to get valid neighbors for BFS based on mazeGrid
    const getNeighbors = (y: number, x: number): Cell[] => {
        const neighbors: Cell[] = [];
        // Check East connection: (x,y) to (x+1,y)
        if (x + 1 < W && mazeGrid[y][x][0]) {
            neighbors.push({ y: y, x: x + 1 });
        }
        // Check South connection: (x,y) to (x,y+1)
        if (y + 1 < H && mazeGrid[y][x][1]) {
            neighbors.push({ y: y + 1, x: x });
        }
        // Check West connection: (x,y) from (x-1,y) -- which is (x-1,y)'s East passage
        if (x - 1 >= 0 && mazeGrid[y][x - 1][0]) {
            neighbors.push({ y: y, x: x - 1 });
        }
        // Check North connection: (x,y) from (x,y-1) -- which is (x,y-1)'s South passage
        if (y - 1 >= 0 && mazeGrid[y - 1][x][1]) {
            neighbors.push({ y: y - 1, x: x });
        }
        return neighbors;
    };

    // BFS from entrance (0,0) to find all distances and parents
    const distFromEntrance: number[][] = Array(H).fill(0).map(() => Array(W).fill(Infinity));
    const parentOfEntrancePath: Cell[][] = Array(H).fill(0).map(() => Array(W).fill(null));
    const qEntrance: [Cell, number][] = [];

    distFromEntrance[0][0] = 0;
    qEntrance.push([{ y: 0, x: 0 }, 0]);

    let headE = 0;
    while (headE < qEntrance.length) {
        const [{ y, x }, dist] = qEntrance[headE++];
        for (const neighbor of getNeighbors(y, x)) {
            if (distFromEntrance[neighbor.y][neighbor.x] === Infinity) {
                distFromEntrance[neighbor.y][neighbor.x] = dist + 1;
                parentOfEntrancePath[neighbor.y][neighbor.x] = { y, x };
                qEntrance.push([neighbor, dist + 1]);
            }
        }
    }

    // Find Treasure (T_cell): the cell furthest from the entrance (0,0)
    let T_cell: Cell = { y: 0, x: 0 }; // Initialize with entrance, will be updated
    let maxDistFromEntrance = 0;
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            if (distFromEntrance[y][x] !== Infinity && distFromEntrance[y][x] > maxDistFromEntrance) {
                maxDistFromEntrance = distFromEntrance[y][x];
                T_cell = { y, x };
            }
        }
    }

    // BFS from barracks (W-1, H-1) to find shortest distances to all cells
    const distFromBarracks: number[][] = Array(H).fill(0).map(() => Array(W).fill(Infinity));
    const barracksCell: Cell = { y: H - 1, x: W - 1 };
    const qBarracks: [Cell, number][] = [];

    distFromBarracks[barracksCell.y][barracksCell.x] = 0;
    qBarracks.push([barracksCell, 0]);

    let headB = 0;
    while (headB < qBarracks.length) {
        const [{ y, x }, dist] = qBarracks[headB++];
        for (const neighbor of getNeighbors(y, x)) {
            if (distFromBarracks[neighbor.y][neighbor.x] === Infinity) {
                distFromBarracks[neighbor.y][neighbor.x] = dist + 1;
                qBarracks.push([neighbor, dist + 1]);
            }
        }
    }

    // Reconstruct path from entrance to treasure (pathET)
    const pathET: Cell[] = [];
    let currentCell: Cell = T_cell;
    while (currentCell) { // Path reconstruction goes backward from T_cell to (0,0)
        pathET.unshift(currentCell); // Add to the beginning to maintain order
        currentCell = parentOfEntrancePath[currentCell.y][currentCell.x];
    }

    // Find X_cell: the point on pathET closest to the barracks
    let X_cell: Cell = T_cell; // Default: if T is already the closest point
    let minDistToBarracksOnPath = Infinity;

    for (const cell of pathET) {
        // Ensure the cell is reachable from barracks (might not be if isolated path)
        if (distFromBarracks[cell.y][cell.x] !== Infinity) {
            if (distFromBarracks[cell.y][cell.x] < minDistToBarracksOnPath) {
                minDistToBarracksOnPath = distFromBarracks[cell.y][cell.x];
                X_cell = cell;
            }
        }
    }

    // Prepare character map for output
    const mapH = 2 * H + 1;
    const mapW = 2 * W + 1;
    const charMap: string[][] = Array(mapH).fill(0).map(() => Array(mapW).fill('#'));

    // Set global entrance/exit passages
    charMap[0][1] = '.'; // Entrance at (0,0)'s north
    charMap[mapH - 1][mapW - 2] = '.'; // Exit at (W-1,H-1)'s south

    // Fill in maze passages and walls based on mazeGrid
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            const mapY = 2 * y + 1;
            const mapX = 2 * x + 1;

            charMap[mapY][mapX] = '.'; // Center of each grid cell is always a passage

            // Set east passage if open in mazeGrid
            if (x + 1 < W && mazeGrid[y][x][0]) {
                charMap[mapY][mapX + 1] = '.';
            }
            // Set south passage if open in mazeGrid
            if (y + 1 < H && mazeGrid[y][x][1]) {
                charMap[mapY + 1][mapX] = '.';
            }
        }
    }

    // Mark Treasure 'T' and Intersection 'X'
    charMap[2 * T_cell.y + 1][2 * T_cell.x + 1] = 'T';
    // Mark 'X' only if it's a different cell from 'T'
    if (X_cell.y !== T_cell.y || X_cell.x !== T_cell.x) {
        charMap[2 * X_cell.y + 1][2 * X_cell.x + 1] = 'X';
    }

    // Print the final labyrinth map
    for (let r = 0; r < mapH; r++) {
        console.log(charMap[r].join(''));
    }
}

// Call the solve function to run the program
solve();