/**
 * The 4x4 letter grid. Declared globally for easy access within DFS.
 */
const grid: string[][] = [];

/**
 * Arrays for 8-way movement (horizontal, vertical, diagonal) relative to a cell.
 * DR: change in row, DC: change in column.
 */
const DR: number[] = [-1, -1, -1, 0, 0, 1, 1, 1];
const DC: number[] = [-1, 0, 1, -1, 1, -1, 0, 1];

/**
 * Performs a Depth-First Search (DFS) to find if the remaining part of the target word
 * can be formed starting from the current cell (row, col) at the given wordIndex.
 *
 * @param row The current row in the grid.
 * @param col The current column in the grid.
 * @param wordIndex The index of the character we are currently looking for in targetWord.
 * @param targetWord The word we are trying to find.
 * @param visited A 2D boolean array to keep track of cells visited in the current path for the word.
 * @returns true if the word can be formed from this point onwards, false otherwise.
 */
function dfs(row: number, col: number, wordIndex: number, targetWord: string, visited: boolean[][]): boolean {
    // Mark the current cell as visited for this path.
    // We are guaranteed that grid[row][col] matches targetWord[wordIndex] when this function is called,
    // either from the main loop or a previous recursive call.
    visited[row][col] = true;

    // Base case: If we have successfully matched all characters of the word, return true.
    // This means wordIndex points to the last character, and it has just been matched.
    if (wordIndex === targetWord.length - 1) {
        return true;
    }

    // Explore all 8 adjacent cells
    for (let i = 0; i < 8; i++) {
        const newR = row + DR[i];
        const newC = col + DC[i];

        // Check conditions for the next cell:
        // 1. Is within grid boundaries (4x4 grid: 0 to 3 for rows and columns).
        // 2. Has not been visited yet in the current path for the word.
        // 3. The character in the new cell matches the next character we are looking for in targetWord.
        if (newR >= 0 && newR < 4 && newC >= 0 && newC < 4 &&
            !visited[newR][newC] && grid[newR][newC] === targetWord[wordIndex + 1]) {

            // If the recursive call finds the rest of the word from this new cell,
            // then the entire word is found, so propagate true up.
            if (dfs(newR, newC, wordIndex + 1, targetWord, visited)) {
                return true;
            }
        }
    }

    // Backtrack: If no path originating from this current cell led to finding the complete word,
    // unmark the current cell as visited. This allows other potential paths (e.g., paths starting
    // from a different initial grid cell for the same word) to use this cell later.
    visited[row][col] = false;
    return false; // The word was not found through any path starting from this cell.
}

/**
 * Main function to solve the Boggle puzzle.
 * Reads input, processes words, and prints results.
 */
function solveBoggle(): void {
    // Read the 4x4 letter grid from standard input.
    for (let i = 0; i < 4; i++) {
        const line: string = readline();
        grid.push(line.split('')); // Split line into individual characters.
    }

    // Read the number of words to check.
    const N: number = parseInt(readline());

    // Process each candidate word.
    for (let i = 0; i < N; i++) {
        const wordToCheck: string = readline();
        let foundWord = false;

        // Iterate through every cell in the grid as a potential starting point for the word.
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                // If the current cell's letter matches the first letter of the word,
                // initiate a DFS search from this cell.
                if (grid[r][c] === wordToCheck[0]) {
                    // Initialize a fresh 'visited' array for each new word search attempt.
                    // This is crucial because cell usage is "once per word", not "once forever".
                    // Array(4).fill(0).map(() => Array(4).fill(false)) creates a new 2D array
                    // where each inner array is also a distinct new array, avoiding reference issues.
                    const visited: boolean[][] = Array(4).fill(0).map(() => Array(4).fill(false));

                    // Start the DFS from this initial cell.
                    if (dfs(r, c, 0, wordToCheck, visited)) {
                        foundWord = true;
                        break; // Word found, no need to check other starting positions for this word.
                    }
                }
            }
            if (foundWord) {
                break; // Word found, no need to check other starting rows for this word.
            }
        }
        // Output the result (true/false) for the current word.
        console.log(foundWord ? "true" : "false");
    }
}

// Call the main function to execute the Boggle solver.
solveBoggle();