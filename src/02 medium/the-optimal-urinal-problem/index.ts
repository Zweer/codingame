// --- Start of helper data structures ---

// MaxHeap implementation
// Used to prioritize urinals based on score (max) then index (min)
class MaxHeap<T> {
    private heap: T[] = [];
    private compare: (a: T, b: T) => number; // Returns >0 if a has higher priority than b

    constructor(compare: (a: T, b: T) => number) {
        this.compare = compare;
    }

    push(item: T): void {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): T | undefined {
        if (this.heap.length === 0) return undefined;
        if (this.heap.length === 1) return this.heap.pop();

        const max = this.heap[0];
        this.heap[0] = this.heap.pop()!;
        this.bubbleDown(0);
        return max;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            // If current item has higher priority than parent
            if (this.compare(this.heap[index], this.heap[parentIndex]) > 0) {
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
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let highestPriorityIndex = index;

            // Check left child
            if (leftChildIndex <= lastIndex && this.compare(this.heap[leftChildIndex], this.heap[highestPriorityIndex]) > 0) {
                highestPriorityIndex = leftChildIndex;
            }

            // Check right child
            if (rightChildIndex <= lastIndex && this.compare(this.heap[rightChildIndex], this.heap[highestPriorityIndex]) > 0) {
                highestPriorityIndex = rightChildIndex;
            }

            if (highestPriorityIndex !== index) {
                [this.heap[index], this.heap[highestPriorityIndex]] = [this.heap[highestPriorityIndex], this.heap[index]];
                index = highestPriorityIndex;
            } else {
                break;
            }
        }
    }
}

// Node for a custom Doubly Linked List to maintain occupied urinals in sorted order
// and enable O(1) predecessor/successor lookups once a node's value is known.
class LinkedListNode {
    value: number;
    prev: LinkedListNode | null = null;
    next: LinkedListNode | null = null;

    constructor(value: number) {
        this.value = value;
    }
}

// --- Helper function for calculating urinal and score for a segment ---
// A segment is a contiguous block of empty urinals defined by occupied boundaries U_L and U_R.
// Example: U_L _ _ _ U_R => segment start is U_L+1, end is U_R-1.
function calculateSegmentData(segmentStart: number, segmentEnd: number): { score: number; urinal: number } {
    const length = segmentEnd - segmentStart + 1; // Length of the *empty* urinal block
    const chosenUrinal = segmentStart + Math.floor((length - 1) / 2);
    // Score is the minimum distance to an occupied urinal.
    // For a urinal chosen in the middle of a segment of length L,
    // this distance is floor((L-1)/2) + 1.
    const score = Math.floor((length - 1) / 2) + 1;
    return { score, urinal: chosenUrinal };
}

// --- Simulate function for a given n and first_i ---
function simulate(n: number, first_i: number): number {
    // `occupied` set keeps track of urinals that are currently occupied.
    const occupied = new Set<number>();
    
    // `nodeMap` stores `urinal_value -> LinkedListNode` for efficient DLL updates.
    const nodeMap = new Map<number, LinkedListNode>();

    // Initialize doubly linked list with virtual boundaries (0 and n+1)
    const headSentinel = new LinkedListNode(0);
    const tailSentinel = new LinkedListNode(n + 1);
    headSentinel.next = tailSentinel;
    tailSentinel.prev = headSentinel;
    nodeMap.set(0, headSentinel);
    nodeMap.set(n + 1, tailSentinel);

    // Function to add a new urinal `u` to the occupied list
    // This assumes `u` is inserted between `prevOccupied` and `nextOccupied`
    // which are guaranteed to be valid immediate neighbors by the PQ logic.
    function addUrinalToOccupiedList(u: number, prevOccupied: number, nextOccupied: number): void {
        const newNode = new LinkedListNode(u);
        const UL_node = nodeMap.get(prevOccupied)!;
        const UR_node = nodeMap.get(nextOccupied)!;

        newNode.prev = UL_node;
        newNode.next = UR_node;
        UL_node.next = newNode;
        UR_node.prev = newNode;
        nodeMap.set(u, newNode);
    }

    // --- Start initial placement ---
    addUrinalToOccupiedList(first_i, 0, n + 1); // First urinal is placed between virtual walls
    occupied.add(first_i);
    let numGuys = 1;

    // Priority queue: [score, urinal_to_pick, prevOccupiedBoundary, nextOccupiedBoundary]
    // Order: max score, then min urinal_to_pick for tie-breaking.
    const pq = new MaxHeap<[number, number, number, number]>(
        (a, b) => {
            if (a[0] !== b[0]) return a[0] - b[0]; // Scores: higher score first (descending order)
            return b[1] - a[1]; // Urinals: smaller index first (ascending order)
        }
    );

    // Function to add new potential moves (segments) to the PQ
    function addSegmentCandidates(U_L: number, U_R: number): void {
        const segmentStart = U_L + 1; // First empty urinal in segment
        const segmentEnd = U_R - 1;   // Last empty urinal in segment
        
        if (segmentStart > segmentEnd) return; // No empty urinals in this segment

        const { score, urinal } = calculateSegmentData(segmentStart, segmentEnd);
        
        // Push candidate to PQ. `U_L` and `U_R` are the actual occupied boundaries for this segment.
        pq.push([score, urinal, U_L, U_R]);
    }

    // Initialize PQ with segments created by the first guy `first_i`
    addSegmentCandidates(0, first_i);
    addSegmentCandidates(first_i, n + 1);

    // --- Simulate subsequent guy placements ---
    while (!pq.isEmpty()) {
        const [score, u, prevOccupied, nextOccupied] = pq.pop()!;

        // Stale Entry Checks:
        // 1. Is 'u' already occupied? (Could be picked by a previous guy, or is the `first_i`)
        if (occupied.has(u)) {
            continue;
        }
        // 2. Are any of 'u's immediate neighbors already occupied? (Violates "no adjacent" rule)
        if (occupied.has(u - 1) || occupied.has(u + 1)) {
            continue;
        }
        // 3. Has the segment `(prevOccupied, nextOccupied)` been split by another urinal since this entry was pushed?
        //    Check if `prevOccupied`'s current successor in the linked list is still `nextOccupied`.
        const current_prev_node = nodeMap.get(prevOccupied);
        if (!current_prev_node || current_prev_node.next?.value !== nextOccupied) {
            continue; // Segment is no longer valid, this entry is stale.
        }

        // If all checks pass, `u` is the urinal chosen by the current guy!
        occupied.add(u);
        numGuys++;

        // Update the doubly linked list of occupied urinals by inserting `u`
        addUrinalToOccupiedList(u, prevOccupied, nextOccupied);

        // Add new segments created by placing `u`
        addSegmentCandidates(prevOccupied, u); // Segment to the left of `u`
        addSegmentCandidates(u, nextOccupied);   // Segment to the right of `u`
    }
    return numGuys;
}

// --- Main solution function ---
const optimalUrinalProblem = (n: number): string => {
    let maxK = 0;
    let bestI = n + 1; // Initialize with a value larger than any possible index

    // Candidate starting positions for the first guy.
    // These are strategic points likely to yield optimal results.
    const candidates = new Set<number>();
    candidates.add(1);
    if (n > 1) candidates.add(n); 

    const mid1 = Math.floor(n / 2);
    const mid2 = Math.ceil(n / 2);

    candidates.add(mid1);
    candidates.add(mid2);

    // Also check immediate neighbors of middle points
    if (mid1 > 1) candidates.add(mid1 - 1);
    if (mid1 < n) candidates.add(mid1 + 1);
    if (mid2 > 1) candidates.add(mid2 - 1);
    if (mid2 < n) candidates.add(mid2 + 1);

    // Filter candidates to ensure they are within [1, n] and sort them
    // Sorting ensures that if multiple `i` give `maxK`, the smallest `i` is picked.
    const filteredCandidates = Array.from(candidates).filter(c => c >= 1 && c <= n).sort((a, b) => a - b);

    // Simulate for each candidate `i`
    for (const i of filteredCandidates) {
        const currentK = simulate(n, i);
        if (currentK > maxK) {
            maxK = currentK;
            bestI = i;
        } else if (currentK === maxK) {
            bestI = Math.min(bestI, i); // Choose smallest `i` for ties
        }
    }

    return `${maxK} ${bestI}`;
};

// --- CodinGame Input/Output handling ---
// The `readline()` function is provided by the CodinGame environment for reading input.
// `console.log()` is used for printing output.

const N: number = parseInt(readline()); // Read N from input

console.log(optimalUrinalProblem(N));