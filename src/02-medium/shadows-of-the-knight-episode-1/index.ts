/**
 * Reads a line from standard input. In CodinGame, this function is usually globally available.
 * @returns The read line as a string.
 */
declare function readline(): string;

/**
 * Writes to standard output. In CodinGame, `console.log` also works and appends a newline.
 * @param message The message to log.
 */
declare function print(message: any): void;

// Read initialization input
// W: width of the building, H: height of the building
const [W, H] = readline().split(' ').map(Number);
// N: maximum number of jumps Batman can make
const N: number = parseInt(readline());
// X0, Y0: Batman's starting position (current window coordinates)
let [currentX, currentY] = readline().split(' ').map(Number);

// Initialize the boundaries of the search space for the bomb's location.
// The bomb can be anywhere within these rectangular bounds.
let minX = 0;       // Smallest possible X coordinate for the bomb
let maxX = W - 1;   // Largest possible X coordinate for the bomb
let minY = 0;       // Smallest possible Y coordinate for the bomb
let maxY = H - 1;   // Largest possible Y coordinate for the bomb

// Game loop: Continues until the bombs are found (game ends automatically)
while (true) {
    // Read the direction of the bombs from Batman's current position
    const bombDir: string = readline();

    // Update the search space boundaries based on the bomb's direction.
    // Each direction clue helps to narrow down the possible range for X or Y.

    // Handle vertical direction (Up/Down)
    if (bombDir.includes('U')) {
        // If bomb is 'Up', it means bombY < currentY.
        // So, the new upper bound for Y search space becomes currentY - 1.
        maxY = currentY - 1;
    }
    if (bombDir.includes('D')) {
        // If bomb is 'Down', it means bombY > currentY.
        // So, the new lower bound for Y search space becomes currentY + 1.
        minY = currentY + 1;
    }

    // Handle horizontal direction (Left/Right)
    if (bombDir.includes('L')) {
        // If bomb is 'Left', it means bombX < currentX.
        // So, the new upper bound for X search space becomes currentX - 1.
        maxX = currentX - 1;
    }
    if (bombDir.includes('R')) {
        // If bomb is 'Right', it means bombX > currentX.
        // So, the new lower bound for X search space becomes currentX + 1.
        minX = currentX + 1;
    }

    // Calculate the next jump position.
    // We choose the midpoint of the current search space.
    // Math.floor is used to ensure integer coordinates.
    currentX = Math.floor((minX + maxX) / 2);
    currentY = Math.floor((minY + maxY) / 2);

    // Output the coordinates of the next window to jump to.
    console.log(`${currentX} ${currentY}`);
}