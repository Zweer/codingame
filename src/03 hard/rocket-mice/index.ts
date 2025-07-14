// Standard input/output for CodinGame
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let inputLines: string[] = [];
rl.on('line', (line: string) => {
    inputLines.push(line);
});

rl.on('close', () => {
    main();
});

let lineIndex = 0;
function readLine(): string {
    return inputLines[lineIndex++];
}

// --- Enum and Interface Definitions ---

enum Direction { N, E, S, W }
enum AnimalType { MOUSE, CAT }
enum CellType { EMPTY, ROCKET, PIT, ARROW, DOOR, WALL }

interface Coordinate { x: number; y: number; }

interface Animal extends Coordinate {
    id: number;
    type: AnimalType;
    direction: Direction;
    prevX?: number; // Stores x before current move, for pass-through eating
    prevY?: number; // Stores y before current move, for pass-through eating
}

interface Door {
    doorCoord: Coordinate; // The (x,y) on the grid where the door is
    wall: Direction; // The side it's on (N, E, S, W)
    initialSpawnCoord: Coordinate; // The (x,y) off-grid where animal spawns
    initialMoveDirection: Direction; // The direction it moves first
    spawnCount: number; // How many animals spawned from this door
}

interface Rocket extends Coordinate {
    playerId: number;
}

interface Arrow extends Coordinate {
    direction: Direction;
    playerId: number;
}

interface Cell {
    type: CellType;
    rocketInfo?: { playerId: number };
    arrowInfo?: { direction: Direction, playerId: number };
}

// --- Global Variables ---
let WIDTH: number;
let HEIGHT: number;
let NUM_PLAYERS: number;
let NUM_DOORS: number;
let NUM_TURNS: number;

let playerScores: number[];
let rocketLocations: Rocket[]; // Store player rockets for easy lookup, and to mark board
let doors: Door[]; // Store door information
let arrowPlacementsInput: { x: number, y: number, dir: Direction }[]; // Pre-read arrow placement instructions

let board: Cell[][]; // The game grid, storing cell types and object info
let currentAnimals: Animal[]; // List of all active animals currently on the board

// --- Constants for Directions ---
const DIR_MAP: { [key: string]: Direction } = { 'N': Direction.N, 'E': Direction.E, 'S': Direction.S, 'W': Direction.W };
const DX = { [Direction.N]: 0, [Direction.E]: 1, [Direction.S]: 0, [Direction.W]: -1 };
const DY = { [Direction.N]: -1, [Direction.E]: 0, [Direction.S]: 1, [Direction.W]: 0 };

// --- Helper Functions ---

function getNextCoord(x: number, y: number, dir: Direction): Coordinate {
    return { x: x + DX[dir], y: y + DY[dir] };
}

function turnCounterClockwise(dir: Direction): Direction {
    switch (dir) {
        case Direction.N: return Direction.W;
        case Direction.E: return Direction.N;
        case Direction.S: return Direction.E;
        case Direction.W: return Direction.S;
    }
}

// --- Main Game Logic ---

function main() {
    // 1. Read input and initialize game state
    let parts = readLine().split(' ').map(Number);
    WIDTH = parts[0];
    HEIGHT = parts[1];

    NUM_PLAYERS = parseInt(readLine());
    NUM_DOORS = parseInt(readLine());
    NUM_TURNS = parseInt(readLine());

    playerScores = new Array(NUM_PLAYERS).fill(0);
    rocketLocations = [];
    doors = [];
    arrowPlacementsInput = [];
    currentAnimals = [];

    // Initialize the game board with empty cells
    board = Array.from({ length: HEIGHT }, () =>
        Array.from({ length: WIDTH }, (): Cell => ({ type: CellType.EMPTY }))
    );

    // Mark pit locations (corners)
    board[0][0].type = CellType.PIT;
    board[0][WIDTH - 1].type = CellType.PIT;
    board[HEIGHT - 1][0].type = CellType.PIT;
    board[HEIGHT - 1][WIDTH - 1].type = CellType.PIT;

    // Read and place rocket locations
    for (let i = 0; i < NUM_PLAYERS; i++) {
        parts = readLine().split(' ').map(Number);
        const rX = parts[0];
        const rY = parts[1];
        rocketLocations.push({ x: rX, y: rY, playerId: i });
        board[rY][rX] = { type: CellType.ROCKET, rocketInfo: { playerId: i } };
    }

    // Read and store door information
    for (let i = 0; i < NUM_DOORS; i++) {
        parts = readLine().split(' ');
        const coordValue = parseInt(parts[0]);
        const wallStr = parts[1];
        let doorCoord: Coordinate;
        let initialSpawnCoord: Coordinate;
        let initialMoveDirection: Direction;
        let wallDir: Direction; // The direction of the wall the door is on

        // Determine door coordinates, initial spawn point, and initial movement direction
        if (wallStr === 'N') { // North wall (y=0)
            doorCoord = { x: coordValue, y: 0 };
            initialSpawnCoord = { x: coordValue, y: -1 }; // Spawn just above
            initialMoveDirection = Direction.S; // Move south
            wallDir = Direction.N;
        } else if (wallStr === 'E') { // East wall (x=WIDTH-1)
            doorCoord = { x: WIDTH - 1, y: coordValue };
            initialSpawnCoord = { x: WIDTH, y: coordValue }; // Spawn just right
            initialMoveDirection = Direction.W; // Move west
            wallDir = Direction.E;
        } else if (wallStr === 'S') { // South wall (y=HEIGHT-1)
            doorCoord = { x: coordValue, y: HEIGHT - 1 };
            initialSpawnCoord = { x: coordValue, y: HEIGHT }; // Spawn just below
            initialMoveDirection = Direction.N; // Move north
            wallDir = Direction.S;
        } else { // West wall (x=0)
            doorCoord = { x: 0, y: coordValue };
            initialSpawnCoord = { x: -1, y: coordValue }; // Spawn just left
            initialMoveDirection = Direction.E; // Move east
            wallDir = Direction.W;
        }
        doors.push({ doorCoord, wall: wallDir, initialSpawnCoord, initialMoveDirection, spawnCount: 0 });
        // Mark door squares on the board. Doors also behave like walls if animals try to move into them.
        board[doorCoord.y][doorCoord.x].type = CellType.DOOR;
    }

    // Read and store arrow placement instructions
    for (let i = 0; i < NUM_TURNS; i++) {
        parts = readLine().split(' ');
        const tX = parseInt(parts[0]);
        const tY = parseInt(parts[1]);
        const dirStr = parts[2];
        arrowPlacementsInput.push({ x: tX, y: tY, dir: DIR_MAP[dirStr] });
    }

    // Initialize data structures for tracking player arrows (FIFO queue per player)
    const playerArrowHistory = new Map<number, Arrow[]>();
    for (let i = 0; i < NUM_PLAYERS; i++) {
        playerArrowHistory.set(i, []);
    }
    let currentPlacingPlayerId = 0; // Player 0 (corresponding to problem's Player 1) starts
    let nextAnimalId = 0; // Unique ID for each animal, useful for Set operations

    // 2. Main game simulation loop
    // The game runs for NUM_TURNS + 1 steps for animal movement and scoring.
    // Arrow placement only happens for the first NUM_TURNS steps.
    for (let turnIndex = 0; turnIndex < NUM_TURNS + 1; turnIndex++) {

        // Step 1: An animal is produced behind each door
        for (const door of doors) {
            door.spawnCount++;
            const animalType = (door.spawnCount % 10 === 0) ? AnimalType.CAT : AnimalType.MOUSE;
            currentAnimals.push({
                id: nextAnimalId++,
                x: door.initialSpawnCoord.x,
                y: door.initialSpawnCoord.y,
                type: animalType,
                direction: door.initialMoveDirection
            });
        }

        // Prepare for simultaneous movement:
        // Create a copy of currentAnimals to process their movement, then rebuild currentAnimals
        const animalsToMove = [...currentAnimals];
        currentAnimals = []; // Clear for animals that remain on board after this step

        // Store positions before movement for pass-through eating detection
        const miceAtLocPrev = new Map<string, Animal[]>();
        const catsAtLocPrev = new Map<string, Animal[]>();
        for (const animal of animalsToMove) {
            const key = `${animal.x},${animal.y}`;
            if (animal.type === AnimalType.MOUSE) {
                if (!miceAtLocPrev.has(key)) miceAtLocPrev.set(key, []);
                miceAtLocPrev.get(key)!.push(animal);
            } else {
                if (!catsAtLocPrev.has(key)) catsAtLocPrev.set(key, []);
                catsAtLocPrev.get(key)!.push(animal);
            }
        }

        const animalsMovedIntoRockets: Animal[] = [];
        const animalsRemainingOnBoard: Animal[] = []; // Animals that moved to a valid non-scoring, non-pit square

        // Step 2: All animals move forward one square, simultaneously
        for (const animal of animalsToMove) {
            animal.prevX = animal.x; // Store previous position
            animal.prevY = animal.y;

            const nextCoord = getNextCoord(animal.x, animal.y, animal.direction);
            animal.x = nextCoord.x;
            animal.y = nextCoord.y;

            // Check if animal leaves the board or falls into a pit
            if (animal.x < 0 || animal.x >= WIDTH || animal.y < 0 || animal.y >= HEIGHT) {
                continue; // Animal is removed from play
            }

            const cell = board[animal.y][animal.x];
            if (cell.type === CellType.PIT) {
                continue; // Animal is removed from play
            }

            if (cell.type === CellType.ROCKET) {
                animalsMovedIntoRockets.push(animal); // Will be processed for scoring
                continue; // Animal is removed from play after scoring
            }

            // Animal is still on the board and not in a special location
            animalsRemainingOnBoard.push(animal);
        }

        // Populate maps for positions *after* movement, for eating detection
        const miceAtLocNext = new Map<string, Animal[]>();
        const catsAtLocNext = new Map<string, Animal[]>();
        for (const animal of animalsRemainingOnBoard) {
            const key = `${animal.x},${animal.y}`;
            if (animal.type === AnimalType.MOUSE) {
                if (!miceAtLocNext.has(key)) miceAtLocNext.set(key, []);
                miceAtLocNext.get(key)!.push(animal);
            } else {
                if (!catsAtLocNext.has(key)) catsAtLocNext.set(key, []);
                catsAtLocNext.get(key)!.push(animal);
            }
        }

        // Steps 3 & 4: Mice score, Cats score
        for (const animal of animalsMovedIntoRockets) {
            const rocketCell = board[animal.y][animal.x];
            // Ensure it's actually a rocket (should always be true based on how animalsMovedIntoRockets is populated)
            if (rocketCell.type === CellType.ROCKET) {
                if (animal.type === AnimalType.MOUSE) {
                    playerScores[rocketCell.rocketInfo!.playerId] += 1;
                } else { // CAT
                    const playerId = rocketCell.rocketInfo!.playerId;
                    playerScores[playerId] = Math.max(0, playerScores[playerId] - 10); // Score never goes below zero
                }
            }
        }

        // Step 5: Mice are eaten
        const eatenMice = new Set<Animal>();

        // 5a: Mice on the same square as a cat (after movement)
        for (const key of miceAtLocNext.keys()) {
            if (catsAtLocNext.has(key)) { // If there are cats on this square too
                for (const mouse of miceAtLocNext.get(key)!) {
                    eatenMice.add(mouse);
                }
            }
        }

        // 5b: Mice eaten in passing (mouse and cat switch positions)
        for (const mouse of animalsRemainingOnBoard) { // Iterate animals that are still on board
            if (mouse.type !== AnimalType.MOUSE || eatenMice.has(mouse)) continue; // Skip if already eaten or not a mouse

            const mousePrevKey = `${mouse.prevX},${mouse.prevY}`;
            const mouseCurrKey = `${mouse.x},${mouse.y}`;

            // Check if there was a cat at the mouse's current (destination) spot *before* movement
            if (catsAtLocPrev.has(mouseCurrKey)) {
                for (const cat of catsAtLocPrev.get(mouseCurrKey)!) {
                    const catCurrKey = `${cat.x},${cat.y}`; // Cat's new position after movement

                    // If the mouse's previous spot is the same as the cat's current spot (they swapped)
                    if (mousePrevKey === catCurrKey) {
                        eatenMice.add(mouse);
                        break; // This mouse is eaten, no need to check other cats for it
                    }
                }
            }
        }

        // Filter out eaten mice for the next step (redirection)
        currentAnimals = animalsRemainingOnBoard.filter(animal => !eatenMice.has(animal));

        // Step 6: All animals on an arrow or facing a wall are redirected
        for (const animal of currentAnimals) {
            const currentCell = board[animal.y][animal.x];

            if (currentCell.type === CellType.ARROW) {
                // If on an arrow, turn to face arrow's direction
                animal.direction = currentCell.arrowInfo!.direction;
            } else {
                // Not on an arrow, check if it faces a wall or a door acting as a wall
                const potentialNextCoord = getNextCoord(animal.x, animal.y, animal.direction);
                let isWallInPath = false;

                // Check if potential next coordinate is out of bounds (acts as a wall)
                if (potentialNextCoord.x < 0 || potentialNextCoord.x >= WIDTH ||
                    potentialNextCoord.y < 0 || potentialNextCoord.y >= HEIGHT) {
                    isWallInPath = true;
                } else {
                    // Check if the cell it would move into is a WALL or DOOR
                    const targetCell = board[potentialNextCoord.y][potentialNextCoord.x];
                    if (targetCell.type === CellType.WALL || targetCell.type === CellType.DOOR) {
                        isWallInPath = true;
                    }
                }

                if (isWallInPath) {
                    animal.direction = turnCounterClockwise(animal.direction);
                }
            }
        }

        // Step 7: The next player to play places an arrow
        // This step is skipped on the final scoring turn (turnIndex === NUM_TURNS)
        if (turnIndex < NUM_TURNS) {
            const arrowInput = arrowPlacementsInput[turnIndex];
            const { x, y, dir } = arrowInput;

            const playerArrows = playerArrowHistory.get(currentPlacingPlayerId)!;

            // Manage the 3-arrow limit per player (FIFO)
            if (playerArrows.length === 3) {
                const oldestArrow = playerArrows.shift()!; // Remove the oldest arrow placed by this player
                board[oldestArrow.y][oldestArrow.x] = { type: CellType.EMPTY }; // Clear it from the board
            }

            // Place the new arrow
            const newArrow: Arrow = { x, y, direction: dir, playerId: currentPlacingPlayerId };
            playerArrows.push(newArrow);
            board[y][x] = { type: CellType.ARROW, arrowInfo: { direction: dir, playerId: currentPlacingPlayerId } };

            // Move to the next player for the next turn
            currentPlacingPlayerId = (currentPlacingPlayerId + 1) % NUM_PLAYERS;
        }
    }

    // 3. Output final scores
    for (const score of playerScores) {
        console.log(score);
    }
}