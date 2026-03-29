// Standard readline function for CodinGame environment
// In a typical Node.js environment, you would use 'require("fs").readFileSync("/dev/stdin", "utf8").split("\n")'
// For CodinGame, 'readline()' reads one line of input.
declare function readline(): string;
// 'print()' is CodinGame's output function, often console.log maps to it.
declare function print(message: string): void;

// Define constants for board dimensions
const ROWS = 3;
const COLS = 4;

// Define the target goal state of the puzzle
const GOAL_BOARD: number[][] = [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [8, 9, 10, 11]
];

// Precompute the target positions for each tile (0-11)
// This map is used to efficiently calculate Manhattan distance heuristic.
const GOAL_POSITIONS = new Map<number, { row: number; col: number }>();
for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
        GOAL_POSITIONS.set(GOAL_BOARD[r][c], { row: r, col: c });
    }
}

// Type definitions for clarity and type safety
type Board = number[][];
type Position = { row: number; col: number; }; // Represents (row, column) coordinates

// Node structure for the A* search algorithm
type Node = {
    board: Board;          // The current state of the puzzle board
    emptyPos: Position;    // The current position of the empty tile (0)
    g: number;             // Cost from the start node to this node (number of moves)
    h: number;             // Estimated cost from this node to the goal (heuristic: Manhattan distance)
    f: number;             // Total estimated cost (g + h) - used for priority queue ordering
    parent: Node | null;   // Reference to the parent node for path reconstruction
    lastMove: Position | null; // The tile that was moved to reach this state
};

// --- Helper Functions ---

/**
 * Converts a board state (2D array) into a unique string key.
 * This is used for storing visited states in a Map to prevent redundant processing.
 * Example: [[1,2],[3,0]] becomes "1,2,3,0"
 */
function boardToString(board: Board): string {
    return board.flat().join(',');
}

/**
 * Finds the current position of the empty tile (0) on the board.
 * @param board The current state of the puzzle board.
 * @returns The {row, col} coordinates of the empty tile.
 * @throws Error if the board does not contain an empty space (0).
 */
function getEmptyPosition(board: Board): Position {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] === 0) {
                return { row: r, col: c };
            }
        }
    }
    throw new Error("Board must contain an empty space (0).");
}

/**
 * Checks if the given board state matches the predefined goal state.
 * @param board The board state to check.
 * @returns True if the board is in the goal state, false otherwise.
 */
function isGoal(board: Board): boolean {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] !== GOAL_BOARD[r][c]) {
                return false;
            }
        }
    }
    return true;
}

/**
 * Calculates the Manhattan distance heuristic for the given board state.
 * The heuristic is the sum of the absolute differences in row and column
 * positions between each tile's current location and its target location.
 * The empty tile (0) is excluded from this calculation.
 * @param board The current state of the puzzle board.
 * @returns The total Manhattan distance.
 */
function calculateManhattanDistance(board: Board): number {
    let distance = 0;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const value = board[r][c];
            if (value === 0) continue; // The empty tile doesn't contribute to the heuristic

            const targetPos = GOAL_POSITIONS.get(value)!; // Get the goal position for this tile
            distance += Math.abs(r - targetPos.row) + Math.abs(c - targetPos.col);
        }
    }
    return distance;
}

/**
 * Applies a move to the board, swapping the specified tile with the empty space.
 * This function creates a deep copy of the board to ensure immutability
 * and prevent side effects on previous board states.
 * @param board The current board state.
 * @param tileToMovePos The coordinates of the tile to move (this tile will swap with the empty space).
 * @param emptyPos The current coordinates of the empty space.
 * @returns A new board state after the move.
 */
function applyMove(board: Board, tileToMovePos: Position, emptyPos: Position): Board {
    // Create a deep copy of the board to avoid modifying the original
    const newBoard = board.map(row => [...row]); 
    const tileValue = newBoard[tileToMovePos.row][tileToMovePos.col];

    // Swap the tile with the empty space
    newBoard[emptyPos.row][emptyPos.col] = tileValue;
    newBoard[tileToMovePos.row][tileToMovePos.col] = 0;
    
    return newBoard;
}

/**
 * Generates a list of all possible valid moves from the current empty position.
 * A move involves sliding an adjacent tile into the empty space.
 * @param emptyPos The current coordinates of the empty space.
 * @returns An array of {row, col} coordinates for tiles that can be moved.
 */
function getPossibleMoves(emptyPos: Position): Position[] {
    const moves: Position[] = [];
    const { row, col } = emptyPos;

    // Check adjacent positions (Up, Down, Left, Right)
    // Up
    if (row > 0) moves.push({ row: row - 1, col: col });
    // Down
    if (row < ROWS - 1) moves.push({ row: row + 1, col: col });
    // Left
    if (col > 0) moves.push({ row: row, col: col - 1 });
    // Right
    if (col < COLS - 1) moves.push({ row: row, col: col + 1 });

    return moves;
}

// --- MinHeap Implementation for A* Priority Queue ---
/**
 * A generic Min-Heap implementation used as a priority queue for A* search.
 * It stores elements and allows efficient retrieval of the element with the minimum value
 * based on a provided comparison function.
 */
class MinHeap<T> {
    private heap: T[] = [];
    private compare: (a: T, b: T) => number; // Comparison function: returns < 0 if a < b, > 0 if a > b, 0 if equal

    /**
     * @param compare A function that defines the sort order of elements.
     *                It should return a negative number if `a` should come before `b`,
     *                a positive number if `a` should come after `b`, or 0 if they are equivalent.
     *                For A* nodes, this function compares their `f` values.
     */
    constructor(compare: (a: T, b: T) => number) {
        this.compare = compare;
    }

    /**
     * Adds an item to the heap, maintaining the heap property.
     * @param item The item to insert.
     */
    insert(item: T): void {
        this.heap.push(item);
        this.bubbleUp();
    }

    /**
     * Removes and returns the item with the minimum value from the heap.
     * @returns The minimum item, or undefined if the heap is empty.
     */
    extractMin(): T | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        if (this.heap.length === 1) {
            return this.heap.pop();
        }
        const min = this.heap[0]; // The root is always the minimum
        this.heap[0] = this.heap.pop()!; // Move the last element to the root
        this.bubbleDown(); // Restore heap property
        return min;
    }

    /**
     * Checks if the heap is empty.
     * @returns True if the heap contains no elements, false otherwise.
     */
    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    /**
     * Moves the last inserted element up the heap to its correct position.
     * This ensures the heap property (parent is smaller than children) is maintained.
     */
    private bubbleUp(): void {
        let index = this.heap.length - 1; // Start from the last element
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2); // Calculate parent index
            // If child is smaller than parent, swap them
            if (this.compare(this.heap[index], this.heap[parentIndex]) < 0) {
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
                index = parentIndex; // Move up to the parent's position
            } else {
                break; // Correct position found
            }
        }
    }

    /**
     * Moves the root element down the heap to its correct position.
     * This ensures the heap property is maintained after extraction.
     */
    private bubbleDown(): void {
        let index = 0; // Start from the root
        const lastIndex = this.heap.length - 1;
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let smallestIndex = index; // Assume current node is the smallest

            // Compare with left child
            if (leftChildIndex <= lastIndex && this.compare(this.heap[leftChildIndex], this.heap[smallestIndex]) < 0) {
                smallestIndex = leftChildIndex;
            }
            // Compare with right child
            if (rightChildIndex <= lastIndex && this.compare(this.heap[rightChildIndex], this.heap[smallestIndex]) < 0) {
                smallestIndex = rightChildIndex;
            }

            // If current node is not the smallest among itself and its children, swap
            if (smallestIndex !== index) {
                [this.heap[index], this.heap[smallestIndex]] = [this.heap[smallestIndex], this.heap[index]];
                index = smallestIndex; // Move down to the swapped child's position
            } else {
                break; // Correct position found
            }
        }
    }
}

// --- A* Search Algorithm ---
/**
 * Solves the 11-puzzle using the A* search algorithm.
 * Finds the shortest path (sequence of moves) from the initial state to the goal state.
 * @param initialBoard The starting configuration of the puzzle board.
 * @returns An array of Position objects representing the sequence of tile coordinates to move,
 *          or null if no solution is found within the MAX_MOVES limit.
 */
function solve11Puzzle(initialBoard: Board): Position[] | null {
    // Initialize the starting node
    const initialEmptyPos = getEmptyPosition(initialBoard);
    const initialH = calculateManhattanDistance(initialBoard);
    const startNode: Node = {
        board: initialBoard,
        emptyPos: initialEmptyPos,
        g: 0,
        h: initialH,
        f: initialH,
        parent: null,
        lastMove: null
    };

    // If the puzzle is already solved, return an empty path
    if (isGoal(initialBoard)) {
        return [];
    }

    // Initialize the open set (priority queue) and closed set (visited states)
    const openSet = new MinHeap<Node>((a, b) => a.f - b.f); // Prioritize nodes with lower f-cost
    openSet.insert(startNode);

    // closedSet stores the minimum 'g' cost found to reach a particular board state (string key)
    const closedSet = new Map<string, number>();
    closedSet.set(boardToString(initialBoard), 0);

    const MAX_MOVES = 50; // Constraint: solution must not exceed 50 moves

    // Main A* search loop
    while (!openSet.isEmpty()) {
        const current = openSet.extractMin()!; // Get the node with the lowest f-cost

        // Pruning: if current path length exceeds max moves, skip this path
        if (current.g >= MAX_MOVES) {
            continue;
        }

        // Check if the goal state has been reached
        if (isGoal(current.board)) {
            // Reconstruct the path from the goal node back to the start
            const path: Position[] = [];
            let temp: Node | null = current;
            while (temp && temp.lastMove) { // Traverse up the parent chain
                path.push(temp.lastMove);
                temp = temp.parent;
            }
            return path.reverse(); // Reverse the path to get moves from start to goal
        }

        // Generate neighbor states by moving adjacent tiles into the empty space
        const possibleMoves = getPossibleMoves(current.emptyPos);
        for (const tileToMovePos of possibleMoves) {
            const newBoard = applyMove(current.board, tileToMovePos, current.emptyPos);
            const newEmptyPos = tileToMovePos; // The tile that moved now occupies the empty spot
            
            const newG = current.g + 1; // Cost to reach this new state is one more move
            const newH = calculateManhattanDistance(newBoard);
            const boardKey = boardToString(newBoard);

            // If this state has been visited before and a shorter or equal path was already found, skip
            if (closedSet.has(boardKey) && newG >= closedSet.get(boardKey)!) {
                continue;
            }

            // This is a new state, or a shorter path to an already visited state
            closedSet.set(boardKey, newG); // Update with the new, possibly better, g-cost
            
            const newNode: Node = {
                board: newBoard,
                emptyPos: newEmptyPos,
                g: newG,
                h: newH,
                f: newG + newH, // Calculate new f-cost
                parent: current,
                lastMove: tileToMovePos // Store the tile that was moved to reach this state
            };
            openSet.insert(newNode); // Add the new node to the priority queue
        }
    }

    // If the open set becomes empty and the goal was not reached, no solution found within limits
    return null;
}

// --- Main Execution Logic ---

// Read the initial board state from standard input
const initialBoard: Board = [];
for (let i = 0; i < ROWS; i++) {
    initialBoard.push(readline().split(' ').map(Number));
}

// Solve the puzzle
const solutionPath = solve11Puzzle(initialBoard);

// Output the sequence of moves
if (solutionPath) {
    for (const move of solutionPath) {
        // Use console.log for local testing or if print is not defined
        // For CodinGame, 'print' is usually preferred if available.
        console.log(`${move.row} ${move.col}`); 
    }
}
// If solutionPath is null, it means no solution was found within the 50-move limit.
// For CodinGame puzzles, this typically means the program should exit without printing anything.