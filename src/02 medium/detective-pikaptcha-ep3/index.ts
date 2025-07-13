// The `readline` function is provided by the CodinGame environment.
declare function readline(): string;

export function solve() {
    const [widthStr, heightStr] = readline().split(' ');
    const width = parseInt(widthStr);
    const height = parseInt(heightStr);

    // Directions: UP, RIGHT, DOWN, LEFT
    // DX[dir] and DY[dir] give the change in x and y for a move in that direction.
    const DX = [0, 1, 0, -1];
    const DY = [-1, 0, 1, 0];

    // Map character directions to numerical directions
    const DIR_MAP: { [key: string]: number } = {
        '^': 0, // UP
        '>': 1, // RIGHT
        'v': 2, // DOWN
        '<': 3  // LEFT
    };

    /**
     * Calculates the next coordinates and direction on the Möbius strip
     * after a theoretical step from (x, y) in the given direction (dir).
     * Handles both horizontal and vertical (twisted) wrapping.
     * @param x Current x-coordinate.
     * @param y Current y-coordinate.
     * @param dir Current direction (0:UP, 1:RIGHT, 2:DOWN, 3:LEFT).
     * @returns An object containing the new x (nx), new y (ny), and new direction (ndir).
     */
    function getMöbiusNextCoord(x: number, y: number, dir: number): { nx: number, ny: number, ndir: number } {
        let nx = x + DX[dir];
        let ny = y + DY[dir];
        let ndir = dir; // New direction typically starts as the current direction

        // Handle horizontal wrapping
        if (nx < 0) { // Moved off left edge
            nx = width - 1;
        } else if (nx >= width) { // Moved off right edge
            nx = 0;
        }
        // Handle vertical wrapping with the Möbius twist
        else if (ny < 0) { // Moved UP from row 0
            ny = height - 1; // Wraps to the last row
            nx = width - 1 - nx; // Horizontal flip of x-coordinate
            ndir = (dir + 2) % 4; // Turn 180 degrees
        } else if (ny >= height) { // Moved DOWN from row height-1
            ny = 0; // Wraps to the first row
            nx = width - 1 - nx; // Horizontal flip of x-coordinate
            ndir = (dir + 2) % 4; // Turn 180 degrees
        }
        return { nx, ny, ndir };
    }

    let startX: number = -1;
    let startY: number = -1;
    let startDir: number = -1;

    // Grid to store maze layout ('0' for passage, '#' for wall)
    const grid: string[][] = [];
    // Counts to store how many times Pikaptcha stepped into each passage cell
    const counts: number[][] = [];

    // Parse input grid and find starting position/direction
    for (let y = 0; y < height; y++) {
        const rowString = readline();
        const rowChars = rowString.split('');
        grid[y] = rowChars;
        counts[y] = new Array(width).fill(0); // Initialize counts for this row

        for (let x = 0; x < width; x++) {
            const char = grid[y][x];
            if (DIR_MAP[char] !== undefined) { // If it's a starting character
                startX = x;
                startY = y;
                startDir = DIR_MAP[char];
                // Replace the starting character with '0' as it's a passage cell
                grid[y][x] = '0';
            }
        }
    }

    const wallSide = readline(); // 'R' for right wall, 'L' for left wall

    // Set current position and direction to starting values
    let currentX = startX;
    let currentY = startY;
    let currentDir = startDir;

    // Mark the initial cell as visited once (Pikaptcha steps INTO it at the start)
    counts[currentY][currentX]++;

    // Simulation loop
    while (true) {
        let moved = false; // Flag to indicate if Pikaptcha successfully moved to a new cell

        let nextX = currentX;
        let nextY = currentY;
        let nextDir = currentDir;

        // Calculate potential next cells and directions for turning right, straight, and left
        const rightTurnDir = (currentDir + 1) % 4;
        const straightDir = currentDir;
        const leftTurnDir = (currentDir + 3) % 4; // (currentDir - 1 + 4) % 4

        const { nx: trX, ny: trY, ndir: trD } = getMöbiusNextCoord(currentX, currentY, rightTurnDir);
        const { nx: tsX, ny: tsY, ndir: tsD } = getMöbiusNextCoord(currentX, currentY, straightDir);
        const { nx: tlX, ny: tlY, ndir: tlD } = getMöbiusNextCoord(currentX, currentY, leftTurnDir);

        if (wallSide === 'R') {
            // Prioritize: Turn Right, then Move Straight, then Turn Left. If all fail, turn 180 degrees.
            if (grid[trY][trX] === '0') { // Check if turning right leads to a passage
                nextX = trX;
                nextY = trY;
                nextDir = trD;
                moved = true;
            } else if (grid[tsY][tsX] === '0') { // Check if moving straight leads to a passage
                nextX = tsX;
                nextY = tsY;
                nextDir = tsD;
                moved = true;
            } else if (grid[tlY][tlX] === '0') { // Check if turning left leads to a passage
                nextX = tlX;
                nextY = tlY;
                nextDir = tlD;
                moved = true;
            } else { // All paths blocked (dead end), turn 180 degrees but do not move
                nextDir = (currentDir + 2) % 4;
            }
        } else { // wallSide === 'L'
            // Prioritize: Turn Left, then Move Straight, then Turn Right. If all fail, turn 180 degrees.
            if (grid[tlY][tlX] === '0') { // Check if turning left leads to a passage
                nextX = tlX;
                nextY = tlY;
                nextDir = tlD;
                moved = true;
            } else if (grid[tsY][tsX] === '0') { // Check if moving straight leads to a passage
                nextX = tsX;
                nextY = tsY;
                nextDir = tsD;
                moved = true;
            } else if (grid[trY][trX] === '0') { // Check if turning right leads to a passage
                nextX = trX;
                nextY = trY;
                nextDir = trD;
                moved = true;
            } else { // All paths blocked (dead end), turn 180 degrees but do not move
                nextDir = (currentDir + 2) % 4;
            }
        }

        // Update Pikaptcha's state
        currentX = nextX;
        currentY = nextY;
        currentDir = nextDir;

        // Increment count only if Pikaptcha actually moved to a new cell.
        // If it just turned around due to a dead end, it didn't "step into" a new cell.
        if (moved) {
            counts[currentY][currentX]++;
        }

        // Termination condition: Pikaptcha has returned to its initial cell AND direction
        if (currentX === startX && currentY === startY && currentDir === startDir) {
            break;
        }
    }

    // Output the resulting grid
    for (let y = 0; y < height; y++) {
        let rowOutput = '';
        for (let x = 0; x < width; x++) {
            if (grid[y][x] === '#') { // Walls remain '#'
                rowOutput += '#';
            } else { // Passages show their visit count
                rowOutput += counts[y][x].toString();
            }
        }
        console.log(rowOutput);
    }
}