// Define readline function for CodinGame environment
declare function readline(): string;

// Class to represent a puzzle state
class State {
    grid: number[][];
    moves: number;
    gridString: string; // Cached string representation of the grid for Set/Map keys

    constructor(grid: number[][], moves: number) {
        this.grid = grid;
        this.moves = moves;
        // Generate the string representation once when the state is created
        this.gridString = this.grid.flat().join(',');
    }
}

// Function to create the target solved grid
// The puzzle should be arranged from 1 to W*H-1, with 0 (empty) at the bottom-right.
function createTargetGrid(H: number, W: number): number[][] {
    const targetGrid: number[][] = Array(H).fill(0).map(() => Array(W).fill(0));
    let currentNumber = 1;
    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            if (r === H - 1 && c === W - 1) {
                targetGrid[r][c] = 0; // Empty space represented by 0
            } else {
                targetGrid[r][c] = currentNumber++;
            }
        }
    }
    return targetGrid;
}

function solvePuzzle(): void {
    const [H, W] = readline().split(' ').map(Number);

    const initialGrid: number[][] = [];
    for (let i = 0; i < H; i++) {
        initialGrid.push(readline().split(' ').map(s => s === '.' ? 0 : Number(s)));
    }

    // Pre-calculate the target grid and its string representation for quick comparison
    const targetGrid = createTargetGrid(H, W);
    const targetGridString = new State(targetGrid, 0).gridString;

    // BFS queue: stores State objects
    const queue: State[] = [];
    // Visited set: stores string representations of grids to avoid cycles
    const visited: Set<string> = new Set();

    // Initialize BFS with the starting state
    const initialState = new State(initialGrid, 0);
    queue.push(initialState);
    visited.add(initialState.gridString);

    // Directions for moving the empty space (corresponding to moving a piece into the empty space)
    // dr: change in row, dc: change in column
    // [-1, 0] means move piece from above empty space into it (empty moves up)
    // [1, 0] means move piece from below empty space into it (empty moves down)
    // [0, -1] means move piece from left of empty space into it (empty moves left)
    // [0, 1] means move piece from right of empty space into it (empty moves right)
    const dr = [-1, 1, 0, 0]; // up, down
    const dc = [0, 0, -1, 1]; // left, right

    // Using a head pointer for the queue to achieve O(1) dequeue operation (amortized)
    let head = 0;

    while (head < queue.length) {
        const currentState = queue[head++]; // Dequeue the current state

        // If the current state is the target, we found the minimum moves
        if (currentState.gridString === targetGridString) {
            console.log(currentState.moves);
            return; // Puzzle solved, exit function
        }

        // Find the position of the empty space (0) in the current grid
        let emptyR = -1;
        let emptyC = -1;
        outerLoop: // Label for breaking out of nested loops
        for (let r = 0; r < H; r++) {
            for (let c = 0; c < W; c++) {
                if (currentState.grid[r][c] === 0) {
                    emptyR = r;
                    emptyC = c;
                    break outerLoop;
                }
            }
        }

        // Explore all possible moves by sliding a piece into the empty space
        for (let i = 0; i < 4; i++) {
            const newR = emptyR + dr[i];
            const newC = emptyC + dc[i];

            // Check if the new position for the piece (which moves into empty space) is within grid boundaries
            if (newR >= 0 && newR < H && newC >= 0 && newC < W) {
                // Create a deep copy of the current grid to generate the next state
                // .map(row => [...row]) ensures a deep copy for a 2D array of primitives
                const nextGrid: number[][] = currentState.grid.map(row => [...row]);
                
                // Swap the piece at (newR, newC) with the empty space
                nextGrid[emptyR][emptyC] = nextGrid[newR][newC];
                nextGrid[newR][newC] = 0; // The piece moved, so its old spot is now empty

                // Create a new State object for the next grid configuration
                const nextState = new State(nextGrid, currentState.moves + 1);

                // If this new state has not been visited, add it to the queue and visited set
                if (!visited.has(nextState.gridString)) {
                    visited.add(nextState.gridString);
                    queue.push(nextState);
                }
            }
        }
    }
}

// Execute the solver function
solvePuzzle();