// Standard CodinGame input/output methods (assuming they are globally available)
declare function readline(): string;
declare function print(message: string): void; // CodinGame often uses print, but console.log also works.

function solve() {
    const [h, w] = readline().split(' ').map(Number);
    const nb = Number(readline());

    const grid: string[][] = [];
    for (let i = 0; i < h; i++) {
        grid.push(readline().split(''));
    }

    // 1. Find Square Parameters
    type SquareInfo = {
        minR: number;
        maxR: number;
        minC: number;
        maxC: number;
        size: number;
    };
    const squareInfos = new Map<number, SquareInfo>();

    // Initialize squareInfos with default values (extreme bounds to find min/max)
    for (let i = 1; i <= nb; i++) {
        squareInfos.set(i, {
            minR: h,
            maxR: -1,
            minC: w,
            maxC: -1,
            size: 0
        });
    }

    // Populate min/max coordinates for each square based on character occurrences
    for (let r = 0; r < h; r++) {
        for (let c = 0; c < w; c++) {
            const char = grid[r][c];
            if (char !== '.') {
                const label = parseInt(char);
                const info = squareInfos.get(label)!; // '!' asserts that info will not be undefined
                info.minR = Math.min(info.minR, r);
                info.maxR = Math.max(info.maxR, r);
                info.minC = Math.min(info.minC, c);
                info.maxC = Math.max(info.maxC, c);
            }
        }
    }

    // Calculate size for each square (size = max_coord - min_coord + 1)
    for (let i = 1; i <= nb; i++) {
        const info = squareInfos.get(i)!;
        info.size = info.maxR - info.minR + 1; // For a square, (maxR - minR + 1) === (maxC - minC + 1)
    }

    // Helper function to check if (r, c) is on the border of a given square's ideal shape
    const isBorderOfSquare = (r: number, c: number, label: number): boolean => {
        const sq = squareInfos.get(label)!;
        // Check if (r, c) is within the square's bounding box
        if (r < sq.minR || r > sq.maxR || c < sq.minC || c > sq.maxC) {
            return false;
        }
        // Check if (r, c) is on the perimeter of the square
        return (r === sq.minR || r === sq.maxR || c === sq.minC || c === sq.maxC);
    };

    // 2. Create Dependency Graph
    // `dependencies.get(A)` will contain labels `B` such that `A -> B` (A must come before B)
    const dependencies = new Map<number, Set<number>>();
    for (let i = 1; i <= nb; i++) {
        dependencies.set(i, new Set<number>());
    }

    // Iterate through the grid to identify 'overrides' which imply dependencies
    for (let r = 0; r < h; r++) {
        for (let c = 0; c < w; c++) {
            const currentLabelChar = grid[r][c];
            if (currentLabelChar === '.') {
                continue; // Empty spot, no label here
            }
            const currentLabel = parseInt(currentLabelChar);

            // Check against all other squares
            for (let otherLabel = 1; otherLabel <= nb; otherLabel++) {
                if (otherLabel === currentLabel) {
                    continue; // A square cannot cover itself in this context
                }
                // If (r,c) is part of `otherLabel`'s border, but `currentLabel` is visible there,
                // it means `currentLabel` was drawn after `otherLabel`.
                // Thus, `otherLabel` must be drawn BEFORE `currentLabel`.
                if (isBorderOfSquare(r, c, otherLabel)) {
                    dependencies.get(otherLabel)!.add(currentLabel);
                }
            }
        }
    }

    // 3. Topological Sort (Kahn's Algorithm)
    // Calculate in-degrees for each node (square label)
    const inDegrees = new Map<number, number>();
    for (let i = 1; i <= nb; i++) {
        inDegrees.set(i, 0);
    }

    // Populate in-degrees based on the dependencies graph
    for (let i = 1; i <= nb; i++) {
        for (const dependentLabel of dependencies.get(i)!) {
            inDegrees.set(dependentLabel, inDegrees.get(dependentLabel)! + 1);
        }
    }

    // Initialize queue with nodes that have an in-degree of 0 (no prerequisites)
    const queue: number[] = [];
    for (let i = 1; i <= nb; i++) {
        if (inDegrees.get(i) === 0) {
            queue.push(i);
        }
    }

    const resultOrder: number[] = [];
    let head = 0; // Use a head pointer to simulate queue efficiently (no array shifts)

    // Process nodes in topological order
    while (head < queue.length) {
        const currentLabel = queue[head++]; // Dequeue
        resultOrder.push(currentLabel); // Add to sorted result

        // For each neighbor (dependent square) of currentLabel
        for (const neighbor of dependencies.get(currentLabel)!) {
            inDegrees.set(neighbor, inDegrees.get(neighbor)! - 1); // Decrement in-degree
            if (inDegrees.get(neighbor) === 0) {
                queue.push(neighbor); // If in-degree becomes 0, add to queue
            }
        }
    }

    // 4. Output Result
    for (const label of resultOrder) {
        const info = squareInfos.get(label)!;
        console.log(`${label} ${info.size}`);
    }
}

// Call the main function to solve the puzzle
solve();