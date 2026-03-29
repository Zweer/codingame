// Car interface
interface Car {
    id: number;
    x: number;
    y: number;
    length: number;
    axis: 'H' | 'V';
}

// BoardState interface for BFS queue
interface BoardState {
    cars: Car[]; // Current configuration of all cars
    moves: string[]; // List of moves taken to reach this state
}

/**
 * Creates a 6x6 grid representing the current board state.
 * Cells contain the ID of the car occupying them, or 0 if empty.
 * @param cars The array of cars currently on the board.
 * @returns A 2D array (6x6) representing the grid.
 */
function createGrid(cars: Car[]): number[][] {
    // Initialize a 6x6 grid with all cells set to 0 (empty)
    const grid: number[][] = Array(6).fill(0).map(() => Array(6).fill(0).map(() => 0));

    // Place each car on the grid
    for (const car of cars) {
        if (car.axis === 'H') {
            // Horizontal car occupies (car.y, car.x) to (car.y, car.x + car.length - 1)
            for (let i = 0; i < car.length; i++) {
                grid[car.y][car.x + i] = car.id;
            }
        } else { // 'V' for vertical car
            // Vertical car occupies (car.y, car.x) to (car.y + car.length - 1, car.x)
            for (let i = 0; i < car.length; i++) {
                grid[car.y + i][car.x] = car.id;
            }
        }
    }
    return grid;
}

/**
 * Generates a unique string hash for a given board state (car configuration).
 * This is used to efficiently check if a state has been visited before in BFS.
 * Cars are sorted by ID to ensure consistent hash regardless of input order.
 * @param cars The array of cars in the current state.
 * @returns A string representation of the board state.
 */
function hashBoardState(cars: Car[]): string {
    // Sort cars by ID to ensure the hash is consistent
    const sortedCars = [...cars].sort((a, b) => a.id - b.id);
    // Map each car to a string "id:x,y" and join them
    return sortedCars.map(c => `${c.id}:${c.x},${c.y}`).join(';');
}

/**
 * Creates a deep clone of the cars array.
 * This is crucial for BFS to ensure that state modifications don't affect previous states.
 * @param cars The array of cars to clone.
 * @returns A new array containing cloned car objects.
 */
function cloneCars(cars: Car[]): Car[] {
    return cars.map(car => ({ ...car })); // Shallow copy of car object is enough as properties are primitives
}

/**
 * Solves the Rush Hour puzzle using Breadth-First Search (BFS).
 * Finds the shortest sequence of moves to get the red car (ID 0) to the exit.
 * @param initialCars The initial configuration of all cars on the board.
 * @returns An array of strings, where each string is a move (e.g., "0 RIGHT").
 *          Returns ["NO SOLUTION FOUND"] if no path is found (should not happen for valid puzzles).
 */
function solveRushHour(initialCars: Car[]): string[] {
    const queue: BoardState[] = []; // BFS queue
    const visited: Set<string> = new Set(); // Set to store hashes of visited board states

    // Initialize the BFS with the starting state
    const initialState: BoardState = {
        cars: cloneCars(initialCars), // Start with a deep copy of initial cars
        moves: [] // No moves made yet
    };

    queue.push(initialState);
    visited.add(hashBoardState(initialState.cars));

    // Main BFS loop
    while (queue.length > 0) {
        const currentState = queue.shift()!; // Dequeue the next state to explore
        const currentCars = currentState.cars;
        const currentMoves = currentState.moves;

        // Check if the red car (ID 0) has reached the exit
        const redCar = currentCars.find(c => c.id === 0)!;
        // The red car is at the exit when its front (x) is 4 and it's on y=2.
        if (redCar.x === 4 && redCar.y === 2) {
            return currentMoves; // Solution found! Return the sequence of moves.
        }

        // Create a grid representation for efficient collision checking in the current state
        const grid = createGrid(currentCars);

        // Iterate through each car on the board to find all possible next moves
        for (let i = 0; i < currentCars.length; i++) {
            const car = currentCars[i];

            // Handle horizontal cars
            if (car.axis === 'H') {
                // Try moving LEFT
                // Check if the cell immediately to the left of the car's current start is within bounds (x > 0)
                // and is empty (grid value is 0).
                if (car.x > 0 && grid[car.y][car.x - 1] === 0) {
                    const newCars = cloneCars(currentCars); // Create new state by cloning current cars
                    newCars[i].x--; // Move the car one step left
                    const newStateHash = hashBoardState(newCars);

                    // If this new state has not been visited, add it to the queue
                    if (!visited.has(newStateHash)) {
                        visited.add(newStateHash);
                        queue.push({
                            cars: newCars,
                            // Add the move to the path
                            moves: [...currentMoves, `${car.id} LEFT`]
                        });
                    }
                }

                // Try moving RIGHT
                // Check if the cell immediately to the right of the car's current end is within bounds
                // (x + length < 6) and is empty.
                if (car.x + car.length < 6 && grid[car.y][car.x + car.length] === 0) {
                    const newCars = cloneCars(currentCars);
                    newCars[i].x++; // Move the car one step right
                    const newStateHash = hashBoardState(newCars);

                    if (!visited.has(newStateHash)) {
                        visited.add(newStateHash);
                        queue.push({
                            cars: newCars,
                            moves: [...currentMoves, `${car.id} RIGHT`]
                        });
                    }
                }

            } else { // Handle vertical cars (car.axis === 'V')
                // Try moving UP
                // Check if the cell immediately above the car's current top is within bounds (y > 0)
                // and is empty.
                if (car.y > 0 && grid[car.y - 1][car.x] === 0) {
                    const newCars = cloneCars(currentCars);
                    newCars[i].y--; // Move the car one step up
                    const newStateHash = hashBoardState(newCars);

                    if (!visited.has(newStateHash)) {
                        visited.add(newStateHash);
                        queue.push({
                            cars: newCars,
                            moves: [...currentMoves, `${car.id} UP`]
                        });
                    }
                }

                // Try moving DOWN
                // Check if the cell immediately below the car's current bottom is within bounds
                // (y + length < 6) and is empty.
                if (car.y + car.length < 6 && grid[car.y + car.length][car.x] === 0) {
                    const newCars = cloneCars(currentCars);
                    newCars[i].y++; // Move the car one step down
                    const newStateHash = hashBoardState(newCars);

                    if (!visited.has(newStateHash)) {
                        visited.add(newStateHash);
                        queue.push({
                            cars: newCars,
                            moves: [...currentMoves, `${car.id} DOWN`]
                        });
                    }
                }
            }
        }
    }

    // If the queue becomes empty and the goal state was never reached,
    // it means there's no solution from the initial state.
    return ["NO SOLUTION FOUND"];
}

// --- Main Program Execution ---

// This variable will store the complete sequence of moves calculated by BFS.
let solutionPath: string[] | null = null;
// This variable keeps track of which move in the solutionPath to output next.
let currentMoveIndex = 0;

// Read the initial number of cars (N) once at the beginning of the game.
const n: number = parseInt(readline());

// The game loop. CodinGame environment calls this code repeatedly for each turn.
while (true) {
    const cars: Car[] = [];
    // Read the current state of all N cars for the current turn.
    for (let i = 0; i < n; i++) {
        const inputs = readline().split(' ');
        const id: number = parseInt(inputs[0]);
        const x: number = parseInt(inputs[1]);
        const y: number = parseInt(inputs[2]);
        const length: number = parseInt(inputs[3]);
        const axis: 'H' | 'V' = inputs[4] as 'H' | 'V';
        cars.push({ id, x, y, length, axis });
    }

    // On the very first turn, 'solutionPath' will be null.
    // This is when we perform the extensive BFS calculation.
    if (solutionPath === null) {
        // Calculate the entire shortest path from the initial configuration.
        // This takes up to 5 seconds on the first turn.
        solutionPath = solveRushHour(cars);
    }

    // After the first turn (or if solutionPath was already calculated),
    // we simply output the next pre-calculated move from the 'solutionPath'.
    // This must be fast (within 100 ms).
    if (solutionPath[currentMoveIndex]) {
        console.log(solutionPath[currentMoveIndex]);
    } else {
        // This case should ideally not be reached if the puzzle is always solvable
        // and the game ends upon victory. It might indicate a problem if the path
        // ran out but the red car isn't at the exit, or a path wasn't found.
        console.error("Error: Ran out of pre-calculated moves.");
        // Fallback for safety, though it likely means something is wrong or game is over.
        console.log("0 RIGHT"); // A safe but potentially incorrect fallback
    }

    currentMoveIndex++;
}