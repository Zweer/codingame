import * as readline from 'readline';

// Define interfaces for better type safety
interface Point {
    x: number;
    y: number;
}

interface QueueItem {
    spot: number;
    moves: number;
    path: number[];
}

// Global variables to store parsed input
let N: number; // Number of spots
let M: number; // Number of orcs
let L: number; // Number of portals (paths)
let spotCoords: Point[] = [];
let orcCoords: Point[] = [];
let adj: Map<number, number[]> = new Map(); // Adjacency list for graph
let startSpot: number;
let endSpot: number;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let lineIndex = 0; // Tracks current line number for parsing input

rl.on('line', (line: string) => {
    if (lineIndex === 0) {
        N = parseInt(line);
    } else if (lineIndex === 1) {
        M = parseInt(line);
    } else if (lineIndex === 2) {
        L = parseInt(line);
    } else if (lineIndex >= 3 && lineIndex < 3 + N) {
        // Read spot coordinates
        const [x, y] = line.split(' ').map(Number);
        spotCoords.push({ x, y });
    } else if (lineIndex >= 3 + N && lineIndex < 3 + N + M) {
        // Read orc coordinates
        const [x, y] = line.split(' ').map(Number);
        orcCoords.push({ x, y });
    } else if (lineIndex >= 3 + N + M && lineIndex < 3 + N + M + L) {
        // Read paths (portals)
        const [n1, n2] = line.split(' ').map(Number);
        // Ensure adjacency list entries exist for both spots
        if (!adj.has(n1)) adj.set(n1, []);
        if (!adj.has(n2)) adj.set(n2, []);
        // Add bidirectional paths
        adj.get(n1)!.push(n2);
        adj.get(n2)!.push(n1);
    } else if (lineIndex === 3 + N + M + L) {
        // Read starting spot
        startSpot = parseInt(line);
    } else if (lineIndex === 4 + N + M + L) {
        // Read ending spot
        endSpot = parseInt(line);
        rl.close(); // All input read, close readline interface
    }
    lineIndex++;
});

// Event listener for when the readline interface closes (all input processed)
rl.on('close', () => {
    solve();
});

/**
 * Calculates the Euclidean distance between two points.
 * @param p1 The first point.
 * @param p2 The second point.
 * @returns The distance between p1 and p2.
 */
function calculateDistance(p1: Point, p2: Point): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Checks if a given spot is safe to reach after a certain number of moves.
 * A spot is unsafe if any orc can reach or pass it within `movesTaken` time.
 * @param targetSpotIndex The index of the spot to check.
 * @param movesTaken The number of moves taken to reach `targetSpotIndex`.
 * @returns True if the spot is safe, false otherwise.
 */
function isSafe(targetSpotIndex: number, movesTaken: number): boolean {
    const targetSpotCoord = spotCoords[targetSpotIndex];

    // If there are no orcs, any spot is inherently safe.
    if (orcCoords.length === 0) {
        return true;
    }

    // According to the problem statement:
    // "If you need N moves to reach a spot, and distance from the starting point of an orc to that spot is <= N, you cannot go there"
    // This applies directly to `movesTaken`.
    for (const orcCoord of orcCoords) {
        const dist = calculateDistance(orcCoord, targetSpotCoord);
        if (dist <= movesTaken) {
            return false; // Orc can reach or pass this spot in `movesTaken` time
        }
    }
    return true;
}

/**
 * Solves the puzzle to find the shortest, safest path using Breadth-First Search (BFS).
 */
function solve(): void {
    // Handle the special case where start and end spots are the same.
    // The path length is 0. Safety implies no orc is exactly at the spot.
    if (startSpot === endSpot) {
        if (isSafe(startSpot, 0)) {
            console.log(startSpot.toString());
        } else {
            console.log("IMPOSSIBLE");
        }
        return;
    }

    const queue: QueueItem[] = [];
    // `minMovesToSpot` stores the minimum number of moves required to reach a spot.
    // Initialize with Infinity for all spots.
    const minMovesToSpot: number[] = Array(N).fill(Infinity);

    // Initial state for BFS: starting spot, 0 moves, path array contains only the start spot.
    // We must ensure the starting spot itself is safe at time 0.
    if (!isSafe(startSpot, 0)) {
        console.log("IMPOSSIBLE");
        return;
    }

    queue.push({ spot: startSpot, moves: 0, path: [startSpot] });
    minMovesToSpot[startSpot] = 0;

    let head = 0; // Use a head pointer for the queue to avoid performance issues with `Array.shift()`

    while (head < queue.length) {
        const { spot: currentSpot, moves: currentMoves, path: currentPath } = queue[head++];

        // Optimization: If we've already found a shorter path to `currentSpot` and processed it,
        // then this current path is suboptimal. Skip further exploration from this state.
        if (currentMoves > minMovesToSpot[currentSpot]) {
            continue;
        }

        // Explore all neighbors of the current spot
        const neighbors = adj.get(currentSpot) || [];
        for (const neighbor of neighbors) {
            const newMoves = currentMoves + 1;

            // Only consider this path if it's strictly shorter than any previously found path to this neighbor.
            // This ensures BFS finds the shortest path first.
            if (newMoves < minMovesToSpot[neighbor]) {
                // Before moving to the neighbor, check if it's safe to reach at `newMoves` time.
                if (isSafe(neighbor, newMoves)) {
                    minMovesToSpot[neighbor] = newMoves; // Update minimum moves to reach this neighbor
                    const newPath = [...currentPath, neighbor]; // Extend the path

                    // If the neighbor is the end spot, we've found the shortest, safest path.
                    console.log(newPath.join(' '));
                    return; // Exit the function as the solution is found

                    // This part should be removed IF the problem asks for ANY shortest path,
                    // but the problem asks for THE shortest, which BFS naturally provides.
                    // queue.push({ spot: neighbor, moves: newMoves, path: newPath });
                }
            }
        }
    }

    // If the BFS completes without reaching the end spot, it means no valid path exists.
    console.log("IMPOSSIBLE");
}