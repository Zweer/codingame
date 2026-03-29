// Helper for input (provided by CodinGame environment)
declare function readline(): string;
declare function print(message: any): void;

// --- Geometric Primitives ---

class Point {
    constructor(public x: number, public y: number) {}

    toString(): string {
        return `(${this.x},${this.y})`;
    }

    equals(other: Point): boolean {
        return this.x === other.x && this.y === other.y;
    }
}

class Segment {
    constructor(public p1: Point, public p2: Point, public id: number) {}

    toString(): string {
        return `S${this.id}: ${this.p1} - ${this.p2}`;
    }
}

// 0 --> Collinear
// 1 --> Clockwise
// 2 --> Counterclockwise
function orientation(p: Point, q: Point, r: Point): number {
    const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (val === 0) return 0; // Collinear
    return (val > 0) ? 1 : 2; // Clockwise or Counterclockwise
}

// Given three collinear points p, q, r, checks if point q lies on segment pr
function onSegment(p: Point, q: Point, r: Point): boolean {
    return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
           q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
}

// Checks if segment s1 (p1, q1) and s2 (p2, q2) intersect.
// Includes cases where they touch at an endpoint or overlap.
// This is the standard segment intersection test.
function doIntersect(s1: Segment, s2: Segment): boolean {
    const p1 = s1.p1, q1 = s1.p2;
    const p2 = s2.p1, q2 = s2.p2;

    const o1 = orientation(p1, q1, p2);
    const o2 = orientation(p1, q1, q2);
    const o3 = orientation(p2, q2, p1);
    const o4 = orientation(p2, q2, q1);

    // General case: segments intersect
    if (o1 !== 0 && o1 !== o2 && o3 !== 0 && o3 !== o4) {
        return true;
    }

    // Special Cases: segments are collinear and overlap
    if (o1 === 0 && onSegment(p1, p2, q1)) return true;
    if (o2 === 0 && onSegment(p1, q2, q1)) return true;
    if (o3 === 0 && onSegment(p2, p1, q2)) return true;
    if (o4 === 0 && onSegment(p2, q1, q2)) return true;

    return false; // Doesn't fall in any of the above cases
}

// --- Main Logic ---

const N_MAX_COORD = 100; // Max coordinate value in problem (1 to 100)
// Grid cells will be (0,0) to (99,99) representing [0,1]x[0,1] to [99,100]x[99,100]
// This covers all integer coordinates.

function solve() {
    const n: number = parseInt(readline());
    const segments: Segment[] = [];
    for (let i = 0; i < n; i++) {
        const [x1, y1, x2, y2] = readline().split(' ').map(Number);
        segments.push(new Segment(new Point(x1, y1), new Point(x2, y2), i));
    }

    // 1. Region Identification using a grid-based BFS
    // regions[x][y] stores the region ID for the cell [x, x+1]x[y, y+1]
    const regions: number[][] = Array(N_MAX_COORD).fill(0).map(() => Array(N_MAX_COORD).fill(0));
    let regionCount = 0; // Total number of unique regions identified

    for (let x = 0; x < N_MAX_COORD; x++) {
        for (let y = 0; y < N_MAX_COORD; y++) {
            if (regions[x][y] === 0) { // If cell is unvisited
                regionCount++;
                const queue: Point[] = [{ x, y }];
                regions[x][y] = regionCount;

                let head = 0;
                while (head < queue.length) {
                    const { x: cx, y: cy } = queue[head++];

                    // Define neighbors and the "wall" segment between current cell and neighbor
                    const neighbors = [
                        // Right neighbor (nx=cx+1, ny=cy), wall is vertical line (cx+1, cy) to (cx+1, cy+1)
                        { nx: cx + 1, ny: cy, wall: new Segment(new Point(cx + 1, cy), new Point(cx + 1, cy + 1), -1) },
                        // Left neighbor (nx=cx-1, ny=cy), wall is vertical line (cx, cy) to (cx, cy+1)
                        { nx: cx - 1, ny: cy, wall: new Segment(new Point(cx, cy), new Point(cx, cy + 1), -1) },
                        // Up neighbor (nx=cx, ny=cy+1), wall is horizontal line (cx, cy+1) to (cx+1, cy+1)
                        { nx: cx, ny: cy + 1, wall: new Segment(new Point(cx, cy + 1), new Point(cx + 1, cy + 1), -1) },
                        // Down neighbor (nx=cx, ny=cy-1), wall is horizontal line (cx, cy) to (cx + 1, cy)
                        { nx: cx, ny: cy - 1, wall: new Segment(new Point(cx, cy), new Point(cx + 1, cy), -1) }
                    ];

                    for (const { nx, ny, wall } of neighbors) {
                        // Check if neighbor cell is within grid bounds
                        if (nx >= 0 && nx < N_MAX_COORD && ny >= 0 && ny < N_MAX_COORD) {
                            let isBlocked = false;
                            for (const s of segments) {
                                if (doIntersect(s, wall)) { // If any input segment intersects the wall
                                    isBlocked = true;
                                    break;
                                }
                            }

                            if (!isBlocked && regions[nx][ny] === 0) { // If not blocked and unvisited
                                regions[nx][ny] = regionCount;
                                queue.push({ x: nx, y: ny });
                            }
                        }
                    }
                }
            }
        }
    }
    
    // 2. Build the Dual Graph G* (Faces as nodes, Segments as edges)
    // Map from actual region ID (from 1 to regionCount) to a compact G* node ID (0 to numGStarNodes-1)
    const regionIdToGStarNodeId = new Map<number, number>();
    let numGStarNodes = 0; // Number of nodes in G*

    // Adjacency list for G* (nodes represented by compact IDs)
    const adjGStar: number[][] = []; 
    // Array to store degrees of G* nodes
    const nodeDegrees: number[] = [];

    // For each input segment, identify the two regions it separates (or one if it's a loop)
    for (const s of segments) {
        // Calculate midpoint of segment s
        const midX = (s.p1.x + s.p2.x) / 2;
        const midY = (s.p1.y + s.p2.y) / 2;

        // Vector representing the segment direction
        const dx = s.p2.x - s.p1.x;
        const dy = s.p2.y - s.p1.y;

        // Perpendicular vector, normalized to a small epsilon (small offset)
        const perpDx = -dy;
        const perpDy = dx;
        const len = Math.sqrt(perpDx * perpDx + perpDy * perpDy);
        const epsilon = 0.001; // Small offset to find points on either side of the segment

        const offsetPx = (perpDx / len) * epsilon;
        const offsetPy = (perpDy / len) * epsilon;

        // Point on one side of segment. Ensure it's strictly within a cell to get its region ID.
        let p1x = midX + offsetPx;
        let p1y = midY + offsetPy;
        // Point on the other side of segment
        let p2x = midX - offsetPx;
        let p2y = midY - offsetPy;

        // Clamp points to be strictly within the grid cells [0, N_MAX_COORD-epsilon)
        // This avoids issues with floating point precision near integer boundaries
        p1x = Math.max(0.0001, Math.min(N_MAX_COORD - 0.0001, p1x));
        p1y = Math.max(0.0001, Math.min(N_MAX_COORD - 0.0001, p1y));
        p2x = Math.max(0.0001, Math.min(N_MAX_COORD - 0.0001, p2x));
        p2y = Math.max(0.0001, Math.min(N_MAX_COORD - 0.0001, p2y));

        // Get the region IDs of the cells containing P1 and P2
        const r1Id = regions[Math.floor(p1x)][Math.floor(p1y)];
        const r2Id = regions[Math.floor(p2x)][Math.floor(p2y)];

        // Map these actual region IDs to compact G* node IDs
        if (!regionIdToGStarNodeId.has(r1Id)) {
            regionIdToGStarNodeId.set(r1Id, numGStarNodes++);
            adjGStar.push([]);
            nodeDegrees.push(0);
        }
        if (!regionIdToGStarNodeId.has(r2Id)) {
            regionIdToGStarNodeId.set(r2Id, numGStarNodes++);
            adjGStar.push([]);
            nodeDegrees.push(0);
        }

        const gStarNode1 = regionIdToGStarNodeId.get(r1Id)!;
        const gStarNode2 = regionIdToGStarNodeId.get(r2Id)!;

        // Add edge to G*. Edge weight is 1.
        adjGStar[gStarNode1].push(gStarNode2);
        nodeDegrees[gStarNode1]++;
        if (gStarNode1 !== gStarNode2) { // If it's not a loop edge
            adjGStar[gStarNode2].push(gStarNode1);
            nodeDegrees[gStarNode2]++;
        }
    }
    
    // 3. Compute All-Pairs Shortest Paths (APSP) in G* using Floyd-Warshall
    // numGStarNodes is at most 2*N (i.e., 50 for N=25), so Floyd-Warshall is feasible.
    const dist: number[][] = Array(numGStarNodes).fill(0).map(() => Array(numGStarNodes).fill(Infinity));
    for (let i = 0; i < numGStarNodes; i++) {
        dist[i][i] = 0; // Distance to self is 0
        for (const neighbor of adjGStar[i]) {
            dist[i][neighbor] = 1; // Direct edge has weight 1
        }
    }

    // Floyd-Warshall algorithm
    for (let k = 0; k < numGStarNodes; k++) {
        for (let i = 0; i < numGStarNodes; i++) {
            for (let j = 0; j < numGStarNodes; j++) {
                if (dist[i][k] !== Infinity && dist[k][j] !== Infinity) {
                    dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);
                }
            }
        }
    }

    // 4. Find odd-degree vertices for Chinese Postman Problem
    const oddNodes: number[] = []; // Stores compact G* node IDs
    for (let i = 0; i < numGStarNodes; i++) {
        if (nodeDegrees[i] % 2 !== 0) {
            oddNodes.push(i);
        }
    }

    // 5. Minimum Weight Perfect Matching on odd-degree vertices using Dynamic Programming
    // `dp[mask]` stores the minimum cost to match the subset of odd nodes represented by `mask`.
    // The number of odd nodes `numOddNodes` is at most `numGStarNodes` (50).
    // This DP approach has complexity O(2^K * K^2) where K is numOddNodes.
    // For K <= 20, it's typically fine. For K=25, it's on the edge.
    const numOddNodes = oddNodes.length;
    const dp: number[] = Array(1 << numOddNodes).fill(Infinity);
    dp[0] = 0; // Base case: cost to match an empty set is 0

    for (let mask = 0; mask < (1 << numOddNodes); mask++) {
        if (dp[mask] === Infinity) continue; // Skip unreachable states

        // Find the first unmatched node in the current mask (first 0 bit)
        let firstUnmatchedIdx = -1;
        for (let i = 0; i < numOddNodes; i++) {
            if (!((mask >> i) & 1)) { // If bit i is 0 (unmatched)
                firstUnmatchedIdx = i;
                break;
            }
        }

        if (firstUnmatchedIdx === -1) { // All nodes matched in this mask, it's a complete matching for this subset
            continue; // No need to explore further from this mask
        }

        const uGStarNode = oddNodes[firstUnmatchedIdx]; // The actual G* node ID for the first unmatched node

        // Try to match this node with every other unmatched node
        for (let j = firstUnmatchedIdx + 1; j < numOddNodes; j++) {
            if (!((mask >> j) & 1)) { // If bit j is 0 (unmatched)
                const vGStarNode = oddNodes[j]; // The actual G* node ID for the other unmatched node
                const newMask = mask | (1 << firstUnmatchedIdx) | (1 << j); // Set bits for both matched nodes
                
                // Add the shortest path distance between u and v to the current cost
                const pathCost = dist[uGStarNode][vGStarNode];
                if (pathCost !== Infinity) { // Only if a path exists
                     dp[newMask] = Math.min(dp[newMask], dp[mask] + pathCost);
                }
            }
        }
    }

    // The minimum additional crossings needed is the cost to match all odd nodes
    const minAdditionalCrossings = dp[(1 << numOddNodes) - 1];
    
    // Total intersections = N (initial crossings, one for each segment) + minAdditionalCrossings
    print(n + minAdditionalCrossings);
}

// Function to simulate readline and print for local testing (remove for CodinGame submission)
/*
const _input: string[] = [];
let _inputIdx = 0;
function _mockReadline(): string { return _input[_inputIdx++]; }
function _mockPrint(message: any): void { console.log(message); }
// Uncomment for local testing
// _input.push("3");
// _input.push("0 0 10 10");
// _input.push("10 10 10 0");
// _input.push("0 0 10 0"); // Expected output: 4
// globalThis.readline = _mockReadline;
// globalThis.print = _mockPrint;
*/

solve();