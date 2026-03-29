// Helper to read input in CodinGame environment
declare function readline(): string;

/**
 * Rotates a 2D character array (map) 90 degrees counter-clockwise.
 * @param map The original map (H rows, W columns).
 * @param H Height of the original map.
 * @param W Width of the original map.
 * @returns The rotated map (W rows, H columns).
 */
function rotate90CounterClockwise(map: string[][], H: number, W: number): string[][] {
    // The new map will have dimensions W x H
    const newMap: string[][] = Array(W).fill(0).map(() => Array(H).fill(''));

    for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
            // Original (r, c) moves to (new_r, new_c)
            // new_r = W - 1 - c (row index in new map)
            // new_c = r         (column index in new map)
            newMap[W - 1 - c][r] = map[r][c];
        }
    }
    return newMap;
}

/**
 * Applies gravity to a 2D character array (map), making '#' characters fall to the bottom of each column.
 * Assumes the map is already in its current gravitational orientation.
 * @param map The map to apply gravity to (H rows, W columns).
 * @param H Height of the map.
 * @param W Width of the map.
 * @returns A new map with gravity applied.
 */
function applyGravity(map: string[][], H: number, W: number): string[][] {
    const newMap: string[][] = Array(H).fill(0).map(() => Array(W).fill(''));

    for (let c = 0; c < W; c++) { // Iterate through columns
        let hashCount = 0;
        for (let r = 0; r < H; r++) { // Count hashes in the current column
            if (map[r][c] === '#') {
                hashCount++;
            }
        }

        // Fill the new column: '.' at top, '#' at bottom
        for (let r = 0; r < H; r++) {
            if (r < H - hashCount) { // Top rows are '.'
                newMap[r][c] = '.';
            } else { // Bottom rows are '#'
                newMap[r][c] = '#';
            }
        }
    }
    return newMap;
}

/**
 * Converts a 2D character array into a unique string representation for hashing.
 * This is crucial for cycle detection.
 * @param map The map to serialize.
 * @returns A string representation of the map.
 */
function serializeMap(map: string[][]): string {
    return map.map(row => row.join('')).join('\n');
}

/**
 * Creates a deep copy of a 2D string array.
 * @param map The map to copy.
 * @returns A deep copy of the map.
 */
function deepCopyMap(map: string[][]): string[][] {
    return map.map(row => [...row]);
}

function solve() {
    // Read initial dimensions
    const [widthStr, heightStr] = readline().split(' ');
    const initialW = parseInt(widthStr);
    const initialH = parseInt(heightStr);

    // Read the operation bitstream in octal form
    const octalOperation = readline();

    // Read the initial landscape map
    const initialMapGrid: string[][] = [];
    for (let i = 0; i < initialH; i++) {
        initialMapGrid.push(readline().split(''));
    }

    // --- Step 1: Convert Octal to Binary and calculate Total Tumbles ---
    let binaryStream = '';
    for (const char of octalOperation) {
        // Convert each octal digit to 3-bit binary string, padding with leading zeros if necessary
        binaryStream += parseInt(char, 8).toString(2).padStart(3, '0');
    }
    // Reverse the binary string to process LSB (least significant bit) first
    binaryStream = binaryStream.split('').reverse().join('');

    let totalTumbles: bigint = 0n; // Use BigInt for potentially very large numbers
    let momentumA: bigint = 1n;
    let momentumB: bigint = 1n;
    let isDriveATurn = true; // Start with Drive A for bit 0

    for (let i = 0; i < binaryStream.length; i++) {
        const bit = binaryStream[i];

        if (isDriveATurn) { // It's Drive A's turn
            if (bit === '1') {
                totalTumbles += momentumA; // If bit is set, A tumbles the landscape
            }
            momentumB += momentumA; // Drive A accelerates Drive B
        } else { // It's Drive B's turn
            if (bit === '1') {
                totalTumbles += momentumB; // If bit is set, B tumbles the landscape
            }
            momentumA += momentumB; // Drive B accelerates Drive A
        }
        isDriveATurn = !isDriveATurn; // Switch drive for the next bit
    }

    // --- Step 2: Simulate Tumbling with Cycle Detection ---
    let currentMap: string[][] = deepCopyMap(initialMapGrid);
    let currentH = initialH;
    let currentW = initialW;

    // mapHistory: stores string representation of map to the tumble count (BigInt) at which it first occurred
    const mapHistory = new Map<string, bigint>();
    // tumbleSequence: stores the actual 2D map objects indexed by their tumble count
    const tumbleSequence: string[][][] = [];

    let finalMapIndex: number; // The index in tumbleSequence that corresponds to the final state
    let cycleFound = false;

    // Loop through tumble counts from 0 up to totalTumbles (or until a cycle is found)
    for (let k = 0n; k <= totalTumbles; k++) {
        const serialized = serializeMap(currentMap);

        if (mapHistory.has(serialized)) {
            // Cycle detected!
            cycleFound = true;
            const firstOccurrenceTumble = mapHistory.get(serialized)!;
            const cycleLength = k - firstOccurrenceTumble;

            // Calculate the effective tumble count within the cycle
            const tumblesIntoCycle = totalTumbles - firstOccurrenceTumble;
            const offsetInCycle = tumblesIntoCycle % cycleLength;
            
            // The final map state is the state at 'firstOccurrenceTumble + offsetInCycle'
            finalMapIndex = Number(firstOccurrenceTumble + offsetInCycle);
            break; // Exit simulation loop
        }

        // Store the current map state for future cycle detection
        mapHistory.set(serialized, k);
        tumbleSequence.push(deepCopyMap(currentMap)); // Store a copy of the map *before* this k-th tumble's transformations

        // If we've simulated up to the total number of tumbles, we're done
        if (k === totalTumbles) {
            finalMapIndex = Number(k);
            break; // Exit simulation loop
        }

        // Perform one tumble operation to get the state for the next iteration (k+1)
        const rotatedMap = rotate90CounterClockwise(currentMap, currentH, currentW);
        // Dimensions swap after rotation
        const [nextH, nextW] = [currentW, currentH]; 
        
        // Apply gravity to the rotated map
        currentMap = applyGravity(rotatedMap, nextH, nextW);
        currentH = nextH;
        currentW = nextW;
    }

    // Retrieve the final map from the sequence
    const finalMap = tumbleSequence[finalMapIndex];

    // --- Step 3: Output the final map ---
    for (let r = 0; r < finalMap.length; r++) {
        console.log(finalMap[r].join(''));
    }
}

// Call the main solve function
solve();