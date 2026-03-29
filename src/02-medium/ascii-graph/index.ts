// The 'readline()' and 'print()' functions are provided by the CodinGame environment.
declare function readline(): string;
declare function print(message: string): void;

function solve() {
    // Read the number of points
    const N: number = parseInt(readline());

    // Use a Set to store points for efficient lookup.
    // Store points as strings like "x,y"
    const points: Set<string> = new Set<string>();

    // Initialize min/max coordinates.
    // Start with 0,0 to ensure the origin is always considered for graph boundaries,
    // even if N=0 or no points are near the origin.
    let minX: number = 0;
    let maxX: number = 0;
    let minY: number = 0;
    let maxY: number = 0;

    // Read each point and update min/max coordinates
    for (let i = 0; i < N; i++) {
        const line: string = readline();
        const coords: number[] = line.split(' ').map(Number);
        const x: number = coords[0];
        const y: number = coords[1];

        // Add the point to the set
        points.add(`${x},${y}`);

        // Update the overall min/max coordinates
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    }

    // Adjust graph boundaries as per the problem statement:
    // (Min/Max coordinate of any given point and/or origin) - 1 / + 1
    minX--;
    maxX++;
    minY--;
    maxY++;

    // Iterate from the top row (maxY) down to the bottom row (minY)
    for (let y = maxY; y >= minY; y--) {
        let rowString: string = "";
        // Iterate from the leftmost column (minX) to the rightmost column (maxX)
        for (let x = minX; x <= maxX; x++) {
            const pointKey: string = `${x},${y}`;
            let char: string = '.'; // Default character for an empty cell

            // Determine the character based on precedence:
            // 1. Is it a given point?
            if (points.has(pointKey)) {
                char = '*';
            } 
            // 2. Is it the origin (0,0)?
            else if (x === 0 && y === 0) {
                char = '+';
            } 
            // 3. Is it on the X-axis (y=0)?
            else if (y === 0) {
                char = '-';
            } 
            // 4. Is it on the Y-axis (x=0)?
            else if (x === 0) {
                char = '|';
            }
            // If none of the above, it remains '.'

            rowString += char;
        }
        // Print the completed row string
        print(rowString);
    }
}

// Call the solve function to execute the program logic
solve();