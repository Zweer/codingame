// For CodinGame, `readline` and `print` are global.
// If running locally, you might need to mock them or use node's `fs` module.
declare function readline(): string;
declare function print(message: any): void;

// Define types for points and block shapes
type Point = { r: number; c: number; };
type BlockShape = Point[];
type BlockOrientation = {
    id: number; // Original block type ID (0-6)
    shape: BlockShape;
};

// Global variables
let W: number;
let H: number;
let prices: number[];
let floorGrid: string[][]; // '.' for empty, '#' for occupied

// Memoization map: Map<key, { cost, counts, ways }>
// key: (row * W + col) * (1 << 8) + (mask_curr << 4) + mask_next
// The 8 bits are 4 for mask_curr and 4 for mask_next
const memo = new Map<number, { cost: number; counts: number[]; ways: number; }>();

// All unique block orientations generated
const allBlockOrientations: BlockOrientation[][] = []; // allBlockOrientations[blockTypeId][orientationIdx]

// Epsilon for float comparisons
const EPSILON = 1e-7; // Standard epsilon value

// Function to normalize a block shape (move its top-leftmost point to (0,0))
// This helps in identifying unique shapes after rotation.
function normalizeShape(shape: BlockShape): BlockShape {
    if (shape.length === 0) return [];
    let minR = Infinity;
    let minC = Infinity;
    for (const p of shape) {
        minR = Math.min(minR, p.r);
        minC = Math.min(minC, p.c);
    }
    return shape.map(p => ({ r: p.r - minR, c: p.c - minC }));
}

// Function to rotate a block shape 90 degrees clockwise
function rotateShape(shape: BlockShape): BlockShape {
    // (r, c) -> (c, -r) for 90 deg clockwise rotation
    return normalizeShape(shape.map(p => ({ r: p.c, c: -p.r })));
}

// Pre-compute all block orientations for each block type
function generateAllBlockOrientations() {
    const initialShapes: BlockShape[] = [
        // Type 1: I
        [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }],
        // Type 2: O
        [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }],
        // Type 3: T
        [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 1, c: 1 }],
        // Type 4: L
        [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 1, c: 0 }],
        // Type 5: J
        [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 1, c: 2 }],
        // Type 6: S
        [{ r: 0, c: 1 }, { r: 0, c: 2 }, { r: 1, c: 0 }, { r: 1, c: 1 }],
        // Type 7: Z
        [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 2 }],
    ];

    for (let id = 0; id < initialShapes.length; id++) {
        const uniqueOrientations: BlockOrientation[] = [];
        const seenShapes = new Set<string>(); // Use string representation to check for uniqueness
        let currentShape = initialShapes[id];

        // A block can have at most 4 unique rotations
        for (let i = 0; i < 4; i++) {
            currentShape = normalizeShape(currentShape);
            // Create a consistent string representation for the shape
            const shapeStr = currentShape.map(p => `${p.r},${p.c}`).sort((a, b) => a.localeCompare(b)).join(';');
            
            if (!seenShapes.has(shapeStr)) {
                seenShapes.add(shapeStr);
                uniqueOrientations.push({ id: id, shape: currentShape });
            }
            currentShape = rotateShape(currentShape); // Prepare for next rotation
        }
        allBlockOrientations.push(uniqueOrientations);
    }
}

// DP function to find min cost, block counts, and ways
// mask_curr: 4 bits representing (r,c), (r,c+1), (r,c+2), (r,c+3). Bit 0b1000 is for (r,c).
// mask_next: 4 bits representing (r+1,c), (r+1,c+1), (r+1,c+2), (r+1,c+3). Bit 0b1000 is for (r+1,c).
function solve(r: number, c: number, mask_curr: number, mask_next: number): { cost: number; counts: number[]; ways: number; } {
    // Base case: All rows processed
    if (r >= H) {
        return { cost: 0, counts: new Array(7).fill(0), ways: 1 };
    }

    // Determine next cell coordinates and prepare new masks for recursive call.
    // These masks `new_mask_curr_for_next_call` and `new_mask_next_for_next_call`
    // represent the state of the window (r', c') to (r'+1, c'+3) *before*
    // any block is placed at (r,c) (if it needs one).
    let next_r = r;
    let next_c = c + 1;
    let new_mask_curr_for_next_call: number;
    let new_mask_next_for_next_call: number;

    if (c === W - 1) { // End of row, move to next row
        next_r = r + 1;
        next_c = 0;
        // The mask for the row (r+1) becomes the current mask for (r+1, 0)
        new_mask_curr_for_next_call = mask_next; 
        // The mask for the row (r+2) starts entirely clear for (r+2, 0)
        new_mask_next_for_next_call = 0; 
    } else { // Move to next column in current row
        // Shift masks left by one bit to move the window one column to the right.
        // The leftmost bit (corresponding to 'c') is discarded, and a 0 is added on the right.
        new_mask_curr_for_next_call = (mask_curr << 1) & 0b1111; 
        new_mask_next_for_next_call = (mask_next << 1) & 0b1111; 
    }

    // Calculate memoization key
    const key = (r * W + c) * (1 << 8) + (mask_curr << 4) + mask_next;
    if (memo.has(key)) {
        return memo.get(key)!;
    }

    let min_cost = Infinity;
    let min_counts: number[] = [];
    let total_ways = 0;

    // Logic for the current cell (r,c)
    // Case 1: Current cell is a wall ('#')
    if (floorGrid[r][c] === '#') {
        // No block needed. Simply recurse to the next cell.
        const res = solve(next_r, next_c, new_mask_curr_for_next_call, new_mask_next_for_next_call);
        min_cost = res.cost;
        min_counts = res.counts;
        total_ways = res.ways;
    } 
    // Case 2: Current cell (r,c) is already covered by a block from the 'past'
    // This is indicated by the most significant bit of mask_curr (0b1000) being set.
    else if ((mask_curr & 0b1000) !== 0) { 
        // Already covered. No block needed. Simply recurse.
        const res = solve(next_r, next_c, new_mask_curr_for_next_call, new_mask_next_for_next_call);
        min_cost = res.cost;
        min_counts = res.counts;
        total_ways = res.ways;
    } 
    // Case 3: Current cell (r,c) is empty ('.') and not yet covered. We MUST place a block here.
    else { 
        for (let blockTypeId = 0; blockTypeId < allBlockOrientations.length; blockTypeId++) {
            const blockPrice = prices[blockTypeId];
            for (const orientation of allBlockOrientations[blockTypeId]) {
                const currentBlockShape = orientation.shape;
                
                let current_placement_is_valid = true;
                // `effective_next_mask_curr/next` will store the mask for the next state,
                // updated to include cells covered by *this* block.
                let effective_next_mask_curr = new_mask_curr_for_next_call;
                let effective_next_mask_next = new_mask_next_for_next_call;
                
                for (const p of currentBlockShape) { // Iterate through each cell of the block shape
                    const cell_r = r + p.r; // Absolute row coordinate
                    const cell_c = c + p.c; // Absolute column coordinate

                    // 1. Check bounds: Block cell must be within the grid.
                    if (cell_r < 0 || cell_r >= H || cell_c < 0 || cell_c >= W) {
                        current_placement_is_valid = false;
                        break;
                    }
                    // 2. Check for walls: Block cell must not overlap with a wall.
                    if (floorGrid[cell_r][cell_c] === '#') {
                        current_placement_is_valid = false;
                        break;
                    }

                    // 3. Check for overlap with cells already covered by the *current* mask state.
                    // This prevents placing a block where another "earlier" block already covers it.
                    let is_covered_by_current_mask_bit = false;
                    if (cell_r === r) { // Cell is in the current row's window relative to (r,c)
                        const mask_offset_c = cell_c - c;
                        if (mask_offset_c >= 0 && mask_offset_c < 4) { // Check if it falls within the 4-cell mask_curr window
                            if ((mask_curr & (1 << (3 - mask_offset_c))) !== 0) {
                                is_covered_by_current_mask_bit = true;
                            }
                        }
                    } else if (cell_r === r + 1) { // Cell is in the next row's window relative to (r,c)
                        const mask_offset_c = cell_c - c;
                        if (mask_offset_c >= 0 && mask_offset_c < 4) { // Check if it falls within the 4-cell mask_next window
                            if ((mask_next & (1 << (3 - mask_offset_c))) !== 0) {
                                is_covered_by_current_mask_bit = true;
                            }
                        }
                    }

                    if (is_covered_by_current_mask_bit) {
                        current_placement_is_valid = false;
                        break;
                    }

                    // If valid so far, mark this cell as covered in the `effective_next_mask` for the *next* recursive call.
                    // These masks are from the perspective of (next_r, next_c).
                    if (cell_r === next_r) {
                        const next_mask_offset_c = cell_c - next_c;
                        if (next_mask_offset_c >= 0 && next_mask_offset_c < 4) {
                            effective_next_mask_curr |= (1 << (3 - next_mask_offset_c));
                        }
                    } else if (cell_r === next_r + 1) {
                        const next_mask_offset_c = cell_c - next_c;
                        if (next_mask_offset_c >= 0 && next_mask_offset_c < 4) {
                            effective_next_mask_next |= (1 << (3 - next_mask_offset_c));
                        }
                    }
                }

                if (!current_placement_is_valid) {
                    continue; // This block placement is not valid, try the next one.
                }

                // If placement is valid, make the recursive call.
                const recursive_res = solve(next_r, next_c, effective_next_mask_curr, effective_next_mask_next);
                
                // Calculate the total cost and update block counts for this path.
                const current_total_cost = blockPrice + recursive_res.cost;
                const current_block_counts = recursive_res.counts.slice(); // Create a deep copy of counts
                current_block_counts[blockTypeId]++; // Increment count for the current block type

                // Update min_cost, min_counts, total_ways based on the current path's result.
                if (current_total_cost < min_cost - EPSILON) { 
                    // Found a new, strictly cheaper solution.
                    min_cost = current_total_cost;
                    min_counts = current_block_counts;
                    total_ways = recursive_res.ways;
                } else if (Math.abs(current_total_cost - min_cost) < EPSILON) { 
                    // Found a solution with the same minimum cost.
                    // The problem states: "The set of blocks with the cheapest price will be unique in all the tests."
                    // This implies that if costs are equal, the block counts must also be identical.
                    // So we just add the ways.
                    total_ways += recursive_res.ways;
                }
            }
        }
    }

    // Memoize the result before returning
    const res_to_memo = { cost: min_cost, counts: min_counts, ways: total_ways };
    memo.set(key, res_to_memo);
    return res_to_memo;
}

// Main function to read input and orchestrate the solution
function main() {
    // Pre-compute all Tetris block orientations once
    generateAllBlockOrientations();

    // Read W and H
    const WH = readline().split(' ').map(Number);
    W = WH[0];
    H = WH[1];

    // Read block prices
    prices = readline().split(' ').map(Number);

    // Read floor grid
    floorGrid = [];
    for (let i = 0; i < H; i++) {
        floorGrid.push(readline().split(''));
    }

    // Start the DP process from (0,0) with initial empty masks
    const result = solve(0, 0, 0, 0); 

    // Print the results in the required format
    print(result.cost.toFixed(2)); // Format price to 2 decimal places
    print(result.counts.join(' ')); // Space-separated block quantities
    print(result.ways);
}

// Call the main function to execute the program
main();