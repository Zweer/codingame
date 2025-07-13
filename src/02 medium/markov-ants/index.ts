// Define readline for TypeScript compiler.
// In the CodinGame environment, `readline()` is globally available.
declare function readline(): string;

// Helper functions for parsing input
const readInt = (): number => parseInt(readline());
const readInts = (): number[] => readline().split(' ').map(Number);

/**
 * Solves a system of linear equations Ax = B using Gaussian elimination with partial pivoting.
 * @param A The coefficient matrix.
 * @param B The constant vector.
 * @returns The solution vector x.
 */
function gaussianElimination(A: number[][], B: number[]): number[] {
    const n = A.length;
    // Create an augmented matrix [A|B]
    const M: number[][] = [];
    for (let i = 0; i < n; i++) {
        M[i] = [...A[i], B[i]];
    }

    // Forward elimination with partial pivoting
    for (let k = 0; k < n; k++) {
        // Find pivot row for current column k
        let maxRow = k;
        for (let i = k + 1; i < n; i++) {
            if (Math.abs(M[i][k]) > Math.abs(M[maxRow][k])) {
                maxRow = i;
            }
        }
        // Swap rows to bring the pivot to the diagonal
        [M[k], M[maxRow]] = [M[maxRow], M[k]];

        // Normalize the pivot row (make M[k][k] = 1)
        const pivot = M[k][k];
        if (pivot === 0) {
            // This case indicates a singular or near-singular matrix.
            // For this specific problem (Markov chains with absorption),
            // a unique solution is guaranteed, so this shouldn't be hit.
            throw new Error("Matrix is singular or near-singular.");
        }
        for (let j = k; j <= n; j++) {
            M[k][j] /= pivot;
        }

        // Eliminate other rows (make elements in column k below and above M[k][k] zero)
        for (let i = 0; i < n; i++) {
            if (i !== k) { // Skip the pivot row itself
                const factor = M[i][k];
                for (let j = k; j <= n; j++) {
                    M[i][j] -= factor * M[k][j];
                }
            }
        }
    }

    // The solution vector x is now in the last column of the augmented matrix M
    const x: number[] = new Array(n);
    for (let i = 0; i < n; i++) {
        x[i] = M[i][n];
    }
    return x;
}

function solveMarkovAnts() {
    const step = readInt();
    const [w, h] = readInts();

    const grid: string[][] = [];
    let startX: number = -1;
    let startY: number = -1;

    // Read the grid and find the starting position of the ant 'A'
    for (let i = 0; i < h; i++) {
        const row = readline().split('');
        grid.push(row);
        const antCol = row.indexOf('A');
        if (antCol !== -1) {
            startX = antCol;
            startY = i;
        }
    }

    // Identify all internal cells and map them to a 1D index
    // Internal cells are those not on the border: x from 1 to w-2, y from 1 to h-2
    const internalCells: [number, number][] = [];
    const coordToIndex = new Map<string, number>();

    let currentIndex = 0;
    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            internalCells.push([x, y]);
            coordToIndex.set(`${x},${y}`, currentIndex);
            currentIndex++;
        }
    }

    const numInternalStates = internalCells.length;

    // Initialize the coefficient matrix A and constant vector B for Ax = B
    // A[k][k] for E(x,y)
    // A[k][j] for E(neighbor_x, neighbor_y)
    // B[k] = 1 (representing the 1 step taken)
    const A: number[][] = Array.from({ length: numInternalStates }, () => Array(numInternalStates).fill(0));
    const B: number[] = Array(numInternalStates).fill(1);

    // Populate A and B based on the expected value formula
    // E(x,y) = 1 + (1/4) * E(x_N) + (1/4) * E(x_S) + (1/4) * E(x_E) + (1/4) * E(x_W)
    // Rearranged: E(x,y) - (1/4)E(x_N) - (1/4)E(x_S) - (1/4)E(x_E) - (1/4)E(x_W) = 1
    for (let k = 0; k < numInternalStates; k++) {
        const [currentX, currentY] = internalCells[k];

        A[k][k] = 1.0; // Coefficient for E(currentX, currentY)

        // Possible moves: North, South, East, West relative to grid coordinates
        // North: y decreases (up in grid)
        // South: y increases (down in grid)
        // East: x increases (right in grid)
        // West: x decreases (left in grid)
        const moves = [
            [0, -step], // North (dx, dy)
            [0, step],  // South
            [step, 0],  // East
            [-step, 0]  // West
        ];

        for (const [dx, dy] of moves) {
            const nextX = currentX + dx;
            const nextY = currentY + dy;

            // Check if the next position is an absorbing state (on or outside the border)
            // Borders are at x=0, x=w-1, y=0, y=h-1
            const isAbsorbing = (nextX <= 0 || nextX >= w - 1 || nextY <= 0 || nextY >= h - 1);

            if (!isAbsorbing) {
                // If the next position is an internal state, add its negative coefficient to A
                const nextStateIndex = coordToIndex.get(`${nextX},${nextY}`);
                if (nextStateIndex !== undefined) {
                    A[k][nextStateIndex] -= 0.25;
                }
            }
            // If isAbsorbing is true, E(nextX, nextY) is 0, so it contributes nothing to the sum,
            // and B[k] remains 1, correctly representing the '1' in the equation.
        }
    }

    // Solve the system of linear equations
    const solution = gaussianElimination(A, B);

    // Get the expected time for the ant's starting position
    const startStateIndex = coordToIndex.get(`${startX},${startY}`);
    if (startStateIndex === undefined) {
        // This case should not occur based on problem constraints ('A' is always inside)
        throw new Error("Ant's starting position not found in internal states map.");
    }

    const averageTime = solution[startStateIndex];

    // Output the result rounded to 1 decimal place
    console.log(averageTime.toFixed(1));
}

// Execute the main solver function
solveMarkovAnts();