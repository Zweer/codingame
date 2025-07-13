// Helper for custom MinPriorityQueue as TypeScript doesn't have a built-in one
class MinPriorityQueue<T> {
    private heap: T[] = [];
    private compare: (a: T, b: T) => number;

    constructor(compare: (a: T, b: T) => number) {
        this.compare = compare;
    }

    push(item: T): void {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): T | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        const min = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return min;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.compare(this.heap[index], this.heap[parentIndex]) < 0) {
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    private bubbleDown(index: number): void {
        const lastIndex = this.heap.length - 1;
        while (true) {
            const leftChildIndex = 2 * index + 1;
            const rightChildIndex = 2 * index + 2;
            let smallestIndex = index;

            if (leftChildIndex <= lastIndex && this.compare(this.heap[leftChildIndex], this.heap[smallestIndex]) < 0) {
                smallestIndex = leftChildIndex;
            }

            if (rightChildIndex <= lastIndex && this.compare(this.heap[rightChildIndex], this.heap[smallestIndex]) < 0) {
                smallestIndex = rightChildIndex;
            }

            if (smallestIndex !== index) {
                [this.heap[index], this.heap[smallestIndex]] = [this.heap[smallestIndex], this.heap[index]];
                index = smallestIndex;
            } else {
                break;
            }
        }
    }
}

type Point = { x: number; y: number; };
type Town = { x: number; y: number; name: string; floodedVolume: number | null; };

/**
 * Interpolates the Y-coordinate for a given X-coordinate on the relief.
 * Assumes reliefPoints are sorted by X.
 */
function getInterpolatedY(x: number, reliefPoints: Point[]): number {
    // Handle exact matches first
    for (let i = 0; i < reliefPoints.length; i++) {
        if (reliefPoints[i].x === x) {
            return reliefPoints[i].y;
        }
    }

    let p1: Point | null = null;
    let p2: Point | null = null;

    // Find the segment (p1, p2) where x1 <= x <= x2
    for (let i = 0; i < reliefPoints.length; i++) {
        if (reliefPoints[i].x < x) {
            p1 = reliefPoints[i];
        } else if (reliefPoints[i].x > x) {
            p2 = reliefPoints[i];
            break; // Found the segment
        }
    }

    // Handle cases where x is outside the defined relief range
    // Problem constraints imply x will be within the range, but good to be robust.
    if (!p1 && p2) { // x is before the first point
        return reliefPoints[0].y; // Assume flat to the left
    }
    if (p1 && !p2) { // x is after the last point
        return reliefPoints[reliefPoints.length - 1].y; // Assume flat to the right
    }

    // Linear interpolation: y = y1 + (y2 - y1) * (x - x1) / (x2 - x1)
    return p1!.y + (p2!.y - p1!.y) * (x - p1!.x) / (p2!.x - p1!.x);
}


// Read input
const surfacePointCount: number = parseInt(readline());

const reliefPoints: Point[] = [];
for (let i = 0; i < surfacePointCount; i++) {
    const [x, y] = readline().split(' ').map(Number);
    reliefPoints.push({ x, y });
}

const xPortal: number = parseInt(readline());

const townCount: number = parseInt(readline());

const towns: Town[] = [];
for (let i = 0; i < townCount; i++) {
    const [xStr, name] = readline().split(' ');
    towns.push({ x: parseInt(xStr), y: 0, name, floodedVolume: null }); // Y will be interpolated later
}

// 1. Pre-process: Collect all unique X-coordinates and sort them
const allXCoordsSet = new Set<number>();
reliefPoints.forEach(p => allXCoordsSet.add(p.x));
allXCoordsSet.add(xPortal);
towns.forEach(t => allXCoordsSet.add(t.x));

const allXCoords = Array.from(allXCoordsSet).sort((a, b) => a - b);

// Create maps for quick lookup of X to index and vice-versa
const xToIndexMap = new Map<number, number>();
allXCoords.forEach((x, index) => xToIndexMap.set(x, index));

// 2. Pre-process: Create terrainYValues array and populate town Ys
const terrainYValues: number[] = new Array(allXCoords.length);
for (let i = 0; i < allXCoords.length; i++) {
    terrainYValues[i] = getInterpolatedY(allXCoords[i], reliefPoints);
}

// Populate towns with their ground Y-coordinates
const townsAtX = new Map<number, Town[]>(); // Map X-coord to list of towns at that X
towns.forEach(town => {
    town.y = getInterpolatedY(town.x, reliefPoints);
    if (!townsAtX.has(town.x)) {
        townsAtX.set(town.x, []);
    }
    townsAtX.get(town.x)!.push(town);
});

// 3. Dijkstra-like Simulation
const minVolumeToFill: number[] = new Array(allXCoords.length).fill(Infinity);
const waterLevel: number[] = new Array(allXCoords.length); // Stores the current water level at each point
// Initialize waterLevel to terrain height
for (let i = 0; i < allXCoords.length; i++) {
    waterLevel[i] = terrainYValues[i];
}

const portalIdx = xToIndexMap.get(xPortal)!;
minVolumeToFill[portalIdx] = 0;
waterLevel[portalIdx] = terrainYValues[portalIdx]; // Water starts at ground level at the portal

const pq = new MinPriorityQueue<[number, number]>((a, b) => a[0] - b[0]); // Compare by volume
pq.push([0, portalIdx]);

let lastFloodedTownName: string = "";
let maxFloodedVolume: number = -1;

while (!pq.isEmpty()) {
    const [currentVolume, idx] = pq.pop()!;

    if (currentVolume > minVolumeToFill[idx]) {
        continue; // Already found a cheaper path
    }

    const currentX = allXCoords[idx];
    const currentWaterHeightAtX = waterLevel[idx];

    // Check for towns at this X-coordinate
    if (townsAtX.has(currentX)) {
        for (const town of townsAtX.get(currentX)!) {
            if (town.floodedVolume === null && currentWaterHeightAtX >= town.y) {
                town.floodedVolume = currentVolume;
                // Update last flooded town
                if (currentVolume > maxFloodedVolume) {
                    maxFloodedVolume = currentVolume;
                    lastFloodedTownName = town.name;
                }
            }
        }
    }

    // Explore neighbors (idx-1 and idx+1 in allXCoords array)
    for (const dIdx of [-1, 1]) {
        const nextIdx = idx + dIdx;

        if (nextIdx < 0 || nextIdx >= allXCoords.length) {
            continue; // Out of bounds of our discretized X-coordinates
        }

        const nextX = allXCoords[nextIdx];
        const nextTerrainY = terrainYValues[nextIdx];
        const prevWaterLevelAtNextX = waterLevel[nextIdx];

        // The water level at nextX will be at least max(water level at currentX, terrain height at nextX)
        const potentialNewWaterLevelAtNextX = Math.max(currentWaterHeightAtX, nextTerrainY);

        let volumeDelta = 0;
        if (potentialNewWaterLevelAtNextX > prevWaterLevelAtNextX) {
            // Calculate the volume needed to raise the water level in the column at nextX
            // from prevWaterLevelAtNextX to potentialNewWaterLevelAtNextX.
            // This is (height_increase) * width_of_segment.
            const segmentWidth = Math.abs(nextX - currentX);
            volumeDelta = (potentialNewWaterLevelAtNextX - prevWaterLevelAtNextX) * segmentWidth;
        }

        const newTotalVolumeForNextX = currentVolume + volumeDelta;

        if (newTotalVolumeForNextX < minVolumeToFill[nextIdx]) {
            minVolumeToFill[nextIdx] = newTotalVolumeForNextX;
            waterLevel[nextIdx] = potentialNewWaterLevelAtNextX; // Update the water level at nextIdx
            pq.push([newTotalVolumeForNextX, nextIdx]);
        }
    }
}

// Output the name of the last town to be flooded
console.log(lastFloodedTownName);