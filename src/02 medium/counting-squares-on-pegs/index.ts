import * as readline from 'readline';

// Create a readline interface to read input from stdin
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let inputLines: string[] = [];

// Event listener for each line of input
rl.on('line', (line) => {
    inputLines.push(line);
});

// Event listener for when all input has been read
rl.on('close', () => {
    solve();
});

function solve() {
    // Read the number of valid positions for pegs
    const N: number = parseInt(inputLines[0]);

    // Store points in a list for iteration and in a Set for O(1) average-time lookups
    const pointList: { x: number, y: number }[] = [];
    const pointSet: Set<string> = new Set(); 

    // Parse all N points
    for (let i = 1; i <= N; i++) {
        const coords = inputLines[i].split(' ').map(Number);
        const x = coords[0];
        const y = coords[1];
        pointList.push({ x, y });
        pointSet.add(`${x},${y}`); // Store as "x,y" string for Set key
    }

    let squareCount: number = 0;

    // Iterate through all unique pairs of points (P1, P2)
    // We assume P1 and P2 are opposite vertices of a potential square.
    for (let i = 0; i < N; i++) {
        const p1 = pointList[i];
        // Start j from i + 1 to ensure distinct pairs and avoid duplicate (P2, P1) checks
        for (let j = i + 1; j < N; j++) { 
            const p2 = pointList[j];

            // Calculate the differences in coordinates (vector from P1 to P2)
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;

            // Check if the other two potential vertices (P3, P4) would have integer coordinates.
            // P3 = ((x1+x2-dy)/2, (y1+y2+dx)/2)
            // P4 = ((x1+x2+dy)/2, (y1+y2-dx)/2)
            // For P3/P4 coordinates to be integers, (x1+x2-dy) and (y1+y2+dx) etc. must be even.
            // This simplifies to (dx % 2 === dy % 2) OR equivalently (p1.x + p2.x) % 2 === (p1.y + p2.y) % 2.
            // If they have different parities, the calculated points will have non-integer coordinates.
            if ((p1.x + p2.x) % 2 !== (p1.y + p2.y) % 2) {
                continue; // Skip this pair as it cannot form a square with integer vertices
            }

            // Calculate the coordinates of the other two potential vertices (P3, P4)
            // These are derived by rotating the vector (P2-P1)/2 by 90 degrees around the midpoint of P1P2.
            const p3x = (p1.x + p2.x - dy) / 2;
            const p3y = (p1.y + p2.y + dx) / 2;
            
            const p4x = (p1.x + p2.x + dy) / 2;
            const p4y = (p1.y + p2.y - dx) / 2;

            // Create string keys for P3 and P4 to check their existence in the pointSet
            const p3Key = `${p3x},${p3y}`;
            const p4Key = `${p4x},${p4y}`;

            // If both P3 and P4 exist in the input set, we've found a square
            if (pointSet.has(p3Key) && pointSet.has(p4Key)) {
                squareCount++;
            }
        }
    }

    // Each square is counted exactly twice: once for each of its two diagonals.
    // For example, square ABCD is counted when (A,C) is the diagonal pair, and again when (B,D) is the diagonal pair.
    // So, divide the total count by 2 to get the actual number of unique squares.
    console.log(squareCount / 2);
}