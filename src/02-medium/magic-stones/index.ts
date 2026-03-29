import * as readline from 'readline';

// Min-Heap implementation to efficiently get the smallest level
class MinHeap {
    private heap: number[] = [];

    /**
     * Adds a value to the heap.
     * @param val The number to add.
     */
    push(val: number): void {
        this.heap.push(val);
        this.bubbleUp(this.heap.length - 1);
    }

    /**
     * Removes and returns the smallest value from the heap.
     * @returns The smallest number, or undefined if the heap is empty.
     */
    pop(): number | undefined {
        if (this.heap.length === 0) return undefined;
        if (this.heap.length === 1) return this.heap.pop();

        const min = this.heap[0];
        this.heap[0] = this.heap.pop()!; // Move last element to root
        this.bubbleDown(0);
        return min;
    }

    /**
     * Returns the smallest value without removing it.
     * @returns The smallest number, or undefined if the heap is empty.
     */
    peek(): number | undefined {
        return this.heap.length > 0 ? this.heap[0] : undefined;
    }

    /**
     * Returns the number of elements in the heap.
     */
    size(): number {
        return this.heap.length;
    }

    /**
     * Maintains the heap property after adding an element.
     * @param index The index of the newly added element.
     */
    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex] > this.heap[index]) {
                // Swap with parent if parent is larger
                [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
                index = parentIndex;
            } else {
                break; // Heap property satisfied
            }
        }
    }

    /**
     * Maintains the heap property after removing the root element.
     * @param index The index of the element to bubble down (initially root).
     */
    private bubbleDown(index: number): void {
        const lastIndex = this.heap.length - 1;
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let smallestIndex = index;

            // Find the smallest among parent, left child, and right child
            if (leftChildIndex <= lastIndex && this.heap[leftChildIndex] < this.heap[smallestIndex]) {
                smallestIndex = leftChildIndex;
            }
            if (rightChildIndex <= lastIndex && this.heap[rightChildIndex] < this.heap[smallestIndex]) {
                smallestIndex = rightChildIndex;
            }

            // If the smallest is not the current index, swap and continue bubbling down
            if (smallestIndex !== index) {
                [this.heap[index], this.heap[smallestIndex]] = [this.heap[smallestIndex], this.heap[index]];
                index = smallestIndex;
            } else {
                break; // Heap property satisfied
            }
        }
    }
}

// Set up readline for input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let inputLines: string[] = [];

// Read all input lines
rl.on('line', (line) => {
    inputLines.push(line);
});

// Process input after all lines are read
rl.on('close', () => {
    const N: number = parseInt(inputLines[0]);
    const initialLevels: number[] = inputLines[1].split(' ').map(Number);

    // Map to store the count of stones at each level
    const counts = new Map<number, number>();
    // Min-Heap to process levels in ascending order
    const minHeap = new MinHeap();
    // Set to efficiently check if a level is already in the heap
    const levelsInHeap = new Set<number>();

    // Populate counts and initial minHeap
    for (const level of initialLevels) {
        counts.set(level, (counts.get(level) || 0) + 1);
        // Only add unique levels to the heap initially
        if (!levelsInHeap.has(level)) {
            minHeap.push(level);
            levelsInHeap.add(level);
        }
    }

    // Main processing loop
    while (minHeap.size() > 0) {
        const currentLevel = minHeap.pop()!; // Get the smallest level to process
        levelsInHeap.delete(currentLevel); // Remove from tracking set

        const count = counts.get(currentLevel) || 0;

        // If the count for this level is less than 2, no combinations are possible.
        // This can happen if stones were combined from this level in a previous iteration
        // (e.g., if a level was processed, its count became 1, then a new stone for this level
        // was added from 'currentLevel - 1', increasing its count back to 2+).
        // However, with strictly increasing level processing, this `currentLevel` should
        // always have its 'final' count from `currentLevel-1` carry-overs.
        // It's still crucial to check if count < 2.
        if (count < 2) {
            continue;
        }

        const numNewStones = Math.floor(count / 2);
        const remainingStones = count % 2;

        // Update the count for the current level (what's left after combinations)
        counts.set(currentLevel, remainingStones);

        // Add the newly formed stones to the next level
        const nextLevel = currentLevel + 1;
        const currentNextLevelCount = counts.get(nextLevel) || 0;
        counts.set(nextLevel, currentNextLevelCount + numNewStones);

        // If the next level now has enough stones to be combined (>= 2)
        // AND it's not already in the heap (to avoid redundant processing or infinite loops),
        // add it to the heap.
        if (counts.get(nextLevel)! >= 2 && !levelsInHeap.has(nextLevel)) {
            minHeap.push(nextLevel);
            levelsInHeap.add(nextLevel);
        }
    }

    // Calculate the total number of remaining stones (those that could not be combined further)
    let totalStones = 0;
    for (const count of counts.values()) {
        totalStones += count;
    }

    // Output the minimum number of stones
    console.log(totalStones);
});