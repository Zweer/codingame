// MinHeap class implementation
class MinHeap {
    private heap: number[] = [];

    // Helper to get parent index
    private parent(i: number): number {
        return Math.floor((i - 1) / 2);
    }

    // Helpers to get child indices
    private leftChild(i: number): number {
        return 2 * i + 1;
    }

    private rightChild(i: number): number {
        return 2 * i + 2;
    }

    // Helper to swap elements in the heap array
    private swap(i: number, j: number) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    /**
     * Inserts a value into the heap and maintains the heap property.
     * @param value The number to insert.
     */
    insert(value: number) {
        this.heap.push(value);
        this.bubbleUp(); // Restore heap property by moving the new element up
    }

    /**
     * Extracts the minimum value (root) from the heap and maintains the heap property.
     * @returns The minimum value, or undefined if the heap is empty.
     */
    extractMin(): number | undefined {
        if (this.heap.length === 0) {
            return undefined;
        }
        if (this.heap.length === 1) {
            return this.heap.pop(); // If only one element, just remove and return it
        }

        const min = this.heap[0]; // The smallest element is always at the root
        this.heap[0] = this.heap.pop()!; // Move the last element to the root
        this.siftDown(); // Restore heap property by moving the new root down
        return min;
    }

    /**
     * Returns the size of the heap.
     * @returns The number of elements in the heap.
     */
    size(): number {
        return this.heap.length;
    }

    // Moves the last inserted element up the heap until heap property is restored
    private bubbleUp() {
        let currentIndex = this.heap.length - 1;
        while (currentIndex > 0 && this.heap[currentIndex] < this.heap[this.parent(currentIndex)]) {
            this.swap(currentIndex, this.parent(currentIndex));
            currentIndex = this.parent(currentIndex);
        }
    }

    // Moves the root element down the heap until heap property is restored
    private siftDown() {
        let currentIndex = 0;
        const n = this.heap.length;

        while (true) {
            let smallestChildIndex = currentIndex;
            const left = this.leftChild(currentIndex);
            const right = this.rightChild(currentIndex);

            // Check if left child exists and is smaller than current smallest
            if (left < n && this.heap[left] < this.heap[smallestChildIndex]) {
                smallestChildIndex = left;
            }

            // Check if right child exists and is smaller than current smallest
            if (right < n && this.heap[right] < this.heap[smallestChildIndex]) {
                smallestChildIndex = right;
            }

            // If a smaller child was found, swap and continue sifting down
            if (smallestChildIndex !== currentIndex) {
                this.swap(currentIndex, smallestChildIndex);
                currentIndex = smallestChildIndex;
            } else {
                // If no smaller child found, heap property is restored
                break;
            }
        }
    }
}

// Main logic for the puzzle
function solve() {
    // Read the number of cards (N)
    const N: number = parseInt(readline());

    // Read the card health points as a space-separated string, split it,
    // and parse each part into an integer.
    const cardsInput: string[] = readline().split(' ');

    // Initialize the min-heap
    const heap = new MinHeap();

    // Insert all initial card health points into the heap
    for (let i = 0; i < N; i++) {
        heap.insert(parseInt(cardsInput[i]));
    }

    let totalCost = 0;

    // Continue combining cards until only one card remains in the heap
    while (heap.size() > 1) {
        // Extract the two smallest cards from the heap
        // N >= 2 constraint ensures these will not be undefined initially.
        // Subsequent insertions maintain the heap size appropriately.
        const card1 = heap.extractMin()!; 
        const card2 = heap.extractMin()!;

        // Calculate their sum
        const sum = card1 + card2;

        // Add the sum to the total cost (this is the service fee)
        totalCost += sum;

        // Insert the new combined card back into the heap
        heap.insert(sum);
    }

    // Output the lowest total cost
    console.log(totalCost);
}

// Call the solve function to execute the solution
solve();