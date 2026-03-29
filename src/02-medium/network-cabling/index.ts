/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

function solve() {
    // Read the number of buildings
    const N: number = parseInt(readline());

    // Initialize minX and maxX to find the range of x-coordinates for the main cable
    let minX: number = Number.MAX_SAFE_INTEGER;
    let maxX: number = Number.MIN_SAFE_INTEGER;

    // Array to store all y-coordinates
    const yCoords: number[] = [];

    // Read building coordinates and update minX, maxX, and yCoords array
    for (let i = 0; i < N; i++) {
        const inputs = readline().split(' ');
        const x: number = parseInt(inputs[0]);
        const y: number = parseInt(inputs[1]);

        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        yCoords.push(y);
    }

    // Calculate the length of the main cable.
    // This is the horizontal distance between the westernmost and easternmost buildings.
    const mainCableLength: number = maxX - minX;

    // To minimize the sum of absolute differences |y_i - y_main|,
    // y_main should be the median of the y-coordinates.
    // Sort the y-coordinates to find the median.
    yCoords.sort((a, b) => a - b);

    // Find the median y-coordinate.
    // For N elements (0-indexed), the median is at index floor((N-1)/2).
    // This works for both odd and even N, choosing the lower median for even N,
    // which correctly minimizes the sum of absolute differences.
    const medianY: number = yCoords[Math.floor((N - 1) / 2)];

    // Calculate the sum of lengths of dedicated cables.
    // Each dedicated cable's length is the absolute difference between
    // its building's y-coordinate and the main cable's y-coordinate (medianY).
    let dedicatedCablesLength: number = 0;
    for (const y of yCoords) {
        dedicatedCablesLength += Math.abs(y - medianY);
    }

    // The total minimum length is the sum of the main cable length
    // and the total length of all dedicated cables.
    const totalLength: number = mainCableLength + dedicatedCablesLength;

    // Output the result
    console.log(totalLength);
}

// Call the solve function to execute the program
solve();