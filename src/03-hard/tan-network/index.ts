// Required for CodinGame environment
declare function readline(): string;
declare function print(message: any): void; // print is usually just an alias for console.log

// --- MinHeap Implementation (for Dijkstra's Priority Queue) ---
// A generic MinHeap implementation to store [distance, stopId] tuples,
// ordered by distance (the first element of the tuple).
class MinHeap<T> {
    private heap: T[] = [];
    private comparator: (a: T, b: T) => number;

    constructor(comparator: (a: T, b: T) => number) {
        this.comparator = comparator;
    }

    insert(value: T): void {
        this.heap.push(value);
        this.bubbleUp(this.heap.length - 1);
    }

    extractMin(): T | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        if (this.heap.length === 1) {
            return this.heap.pop();
        }
        const min = this.heap[0];
        this.heap[0] = this.heap.pop()!; // Move last element to root
        this.bubbleDown(0);
        return min;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    // Helper to maintain heap property after insertion
    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.comparator(this.heap[index], this.heap[parentIndex]) < 0) {
                // Swap with parent if current is smaller
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parent esempio], this.heap[index]];
                index = parentIndex;
            } else {
                break; // Correct position found
            }
        }
    }

    // Helper to maintain heap property after extraction
    private bubbleDown(index: number): void {
        const lastIndex = this.heap.length - 1;
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let smallestIndex = index;

            // Find the smallest among parent, left child, and right child
            if (leftChildIndex <= lastIndex && this.comparator(this.heap[leftChildIndex], this.heap[smallestIndex]) < 0) {
                smallestIndex = leftChildIndex;
            }

            if (rightChildIndex <= lastIndex && this.comparator(this.heap[rightChildIndex], this.heap[smallestIndex]) < 0) {
                smallestIndex = rightChildIndex;
            }

            if (smallestIndex !== index) {
                // Swap if a smaller child is found
                [this.heap[index], this.heap[smallestIndex]] = [this.heap[smallestIndex], this.heap[index]];
                index = smallestIndex; // Continue bubbling down from the new position
            } else {
                break; // Heap property restored
            }
        }
    }
}


// --- Data Structures ---
interface Stop {
    id: string;
    name: string;
    latitude: number; // in radians
    longitude: number; // in radians
}

// Represents the graph as an adjacency list: Map<stopId, Array<neighbor_info>>
type AdjacencyList = Map<string, Array<{ targetId: string; distance: number }>>;

// --- Utility Functions ---

// Converts degrees to radians for use in trigonometric functions
function toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
}

// Calculates distance between two stops using the provided equirectangular approximation formula.
// Latitudes and longitudes must be in radians.
function calculateDistance(stop1: Stop, stop2: Stop): number {
    const EARTH_RADIUS = 6371; // km

    const lat1 = stop1.latitude;
    const lon1 = stop1.longitude;
    const lat2 = stop2.latitude;
    const lon2 = stop2.longitude;

    const x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2);
    const y = (lat2 - lat1);
    const d = Math.sqrt(x * x + y * y) * EARTH_RADIUS;
    return d;
}

// --- Main Logic ---

function solve() {
    const startStopId = readline();
    const endStopId = readline();

    const N = parseInt(readline());

    const stopsMap = new Map<string, Stop>();
    for (let i = 0; i < N; i++) {
        const line = readline();
        // Example line: StopArea:ABDU,"Abel Durand",,47.22019661,-1.60337553,,,1,
        const parts = line.split(',');
        const id = parts[0];
        // Remove quotes from the name: "Abel Durand" -> Abel Durand
        const name = parts[1].substring(1, parts[1].length - 1); 
        const latitudeDegrees = parseFloat(parts[3]);
        const longitudeDegrees = parseFloat(parts[4]);

        stopsMap.set(id, {
            id: id,
            name: name,
            latitude: toRadians(latitudeDegrees),
            longitude: toRadians(longitudeDegrees)
        });
    }

    const M = parseInt(readline());
    const adj: AdjacencyList = new Map();

    // Initialize adjacency list for all stops with empty arrays
    for (const stopId of stopsMap.keys()) {
        adj.set(stopId, []);
    }

    for (let i = 0; i < M; i++) {
        const line = readline();
        // Example line: StopArea:ABDU StopArea:ABLA
        const [id1, id2] = line.split(' ');

        const stop1 = stopsMap.get(id1);
        const stop2 = stopsMap.get(id2);

        if (stop1 && stop2) {
            const distance = calculateDistance(stop1, stop2);
            // Routes are one-directional
            adj.get(id1)!.push({ targetId: id2, distance: distance });
        }
    }

    // --- Dijkstra's Algorithm ---
    const distances = new Map<string, number>(); // Stores shortest distance from startStopId
    const previous = new Map<string, string>(); // Stores predecessor for path reconstruction
    // Priority queue stores [distance, stopId] tuples, sorted by distance
    const priorityQueue = new MinHeap<[number, string]>((a, b) => a[0] - b[0]); 

    // Initialize distances: all to Infinity, start to 0
    for (const stopId of stopsMap.keys()) {
        distances.set(stopId, Infinity);
    }
    distances.set(startStopId, 0);
    priorityQueue.insert([0, startStopId]);

    let pathFound = false;

    while (!priorityQueue.isEmpty()) {
        const [currentDist, currentStopId] = priorityQueue.extractMin()!;

        // If we've already found a shorter path to this stop, skip
        if (currentDist > (distances.get(currentStopId) || Infinity)) {
            continue;
        }
        
        // If we extracted the end stop, we've found the shortest path
        if (currentStopId === endStopId) {
            pathFound = true;
            break; 
        }

        const neighbors = adj.get(currentStopId);
        if (neighbors) {
            for (const neighbor of neighbors) {
                const newDist = currentDist + neighbor.distance;
                // If a shorter path to neighbor is found
                if (newDist < (distances.get(neighbor.targetId) || Infinity)) {
                    distances.set(neighbor.targetId, newDist);
                    previous.set(neighbor.targetId, currentStopId);
                    priorityQueue.insert([newDist, neighbor.targetId]);
                }
            }
        }
    }

    // --- Path Reconstruction and Output ---
    if (!pathFound) {
        console.log("IMPOSSIBLE");
    } else {
        const path: string[] = [];
        let current: string | undefined = endStopId;

        // Backtrack from endStopId using the 'previous' map
        while (current !== undefined) {
            path.unshift(stopsMap.get(current)!.name); // Add to the beginning of the array
            current = previous.get(current); // Move to the predecessor
        }
        
        // Print each stop name on a new line
        path.forEach(name => console.log(name));
    }
}

solve();