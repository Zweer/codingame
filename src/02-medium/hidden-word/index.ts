// Define directions for searching (dr, dc)
// dr: change in row, dc: change in column
const directions: [number, number][] = [
    [0, 1],   // Right
    [0, -1],  // Left
    [1, 0],   // Down
    [-1, 0],  // Up
    [1, 1],   // Down-Right
    [-1, -1], // Up-Left
    [1, -1],  // Down-Left
    [-1, 1]   // Up-Right
];

/**
 * Checks if the given coordinates (r, c) are within the grid boundaries.
 * @param r The row index.
 * @param c The column index.
 * @param h The height of the grid.
 * @param w The width of the grid.
 * @returns True if coordinates are valid, false otherwise.
 */
function isValid(r: number, c: number, h: number, w: number): boolean {
    return r >= 0 && r < h && c >= 0 && c < w;
}

/**
 * Main function to solve the Hidden Word puzzle.
 * Reads input, searches for words, marks them, and prints the remaining letters.
 */
function solve() {
    // Read the number of words
    const n: number = parseInt(readline());

    // Read the words to find
    const wordsToFind: string[] = [];
    for (let i = 0; i < n; i++) {
        wordsToFind.push(readline());
    }

    // Read grid dimensions (height and width)
    const [h, w] = readline().split(' ').map(Number);

    // Read the grid content
    const grid: string[][] = [];
    for (let i = 0; i < h; i++) {
        grid.push(readline().split('')); // Split each line into an array of characters
    }

    // Initialize a 2D boolean array to keep track of struck letters.
    // All cells are initially false (not struck).
    const struck: boolean[][] = Array(h).fill(0).map(() => Array(w).fill(false));

    // Iterate through each word we need to find
    for (const word of wordsToFind) {
        let wordFoundThisIteration = false; // Flag to stop searching for current word once found
        const wordLength = word.length;

        // Iterate through every cell (r, c) in the grid
        for (let r = 0; r < h; r++) {
            for (let c = 0; c < w; c++) {
                if (wordFoundThisIteration) break; // If this word is already found, move to the next word

                // From current cell (r, c), try all 8 directions
                for (const [dr, dc] of directions) {
                    if (wordFoundThisIteration) break; // If this word is already found, move to the next word

                    // Calculate the coordinates of the last character if the word were to start here
                    const endR = r + (wordLength - 1) * dr;
                    const endC = c + (wordLength - 1) * dc;

                    // Check if the potential end point is within grid boundaries
                    if (!isValid(endR, endC, h, w)) {
                        continue; // This direction doesn't fit the word in the grid
                    }

                    // Attempt to match the word character by character along the current direction
                    let match = true;
                    for (let k = 0; k < wordLength; k++) {
                        const currR = r + k * dr;
                        const currC = c + k * dc;

                        // If any character doesn't match, this is not the word
                        if (grid[currR][currC] !== word[k]) {
                            match = false;
                            break;
                        }
                    }

                    // If a full match is found
                    if (match) {
                        // Mark all letters of the found word as struck
                        for (let k = 0; k < wordLength; k++) {
                            const currR = r + k * dr;
                            const currC = c + k * dc;
                            struck[currR][currC] = true;
                        }
                        wordFoundThisIteration = true; // Mark that this word has been found
                    }
                }
            }
        }
    }

    // After marking all words, collect the unstruck letters
    let secretWord = "";
    for (let r = 0; r < h; r++) {
        for (let c = 0; c < w; c++) {
            if (!struck[r][c]) {
                secretWord += grid[r][c]; // Append unstruck letter
            }
        }
    }

    // Print the final secret word
    console.log(secretWord);
}

// In the CodinGame environment, `readline()` is globally available and
// the `solve()` function would typically be called implicitly or explicitly
// by the testing framework.
// For local testing, you might need to mock `readline` or use a different input method.
solve();