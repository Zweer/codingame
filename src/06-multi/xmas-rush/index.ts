// Define constants
const BOARD_SIZE = 7;
const MAX_MOVES = 20;

// Define enums for clarity
enum Direction {
    UP = "UP",
    RIGHT = "RIGHT",
    DOWN = "DOWN",
    LEFT = "LEFT"
}

// Class to represent a single tile on the board
class Tile {
    hasPath: { [key in Direction]: boolean };
    item: Item | null;
    originalTileString: string; // Store original string for recreating tiles during simulation

    constructor(tileString: string, item: Item | null = null) {
        this.originalTileString = tileString;
        this.hasPath = {
            [Direction.UP]: tileString[0] === '1',
            [Direction.RIGHT]: tileString[1] === '1',
            [Direction.DOWN]: tileString[2] === '1',
            [Direction.LEFT]: tileString[3] === '1'
        };
        this.item = item;
    }

    // Check if current tile's path in `fromDirection` connects with `toTile`'s path in `toDirection`
    canConnect(fromDirection: Direction, toTile: Tile, toDirection: Direction): boolean {
        return this.hasPath[fromDirection] && toTile.hasPath[toDirection];
    }
}

// Class for player information
class PlayerInfo {
    id: number;
    numCards: number; // Total number of quests (hidden and revealed)
    x: number;
    y: number;
    tileString: string; // The tile currently held by the player outside the board

    constructor(id: number, numCards: number, x: number, y: number, tileString: string) {
        this.id = id;
        this.numCards = numCards;
        this.x = x;
        this.y = y;
        this.tileString = tileString;
    }
}

// Class for items
class Item {
    name: string;
    x: number; // -1 if on player's held tile, -2 if on opponent's held tile
    y: number; // -1 or -2 corresponding to x
    playerId: number; // ID of the player who can collect it

    constructor(name: string, x: number, y: number, playerId: number) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.playerId = playerId;
    }
}

// Class for quests (revealed ones)
class Quest {
    itemName: string;
    playerId: number; // ID of the player the quest belongs to

    constructor(itemName: string, playerId: number) {
        this.itemName = itemName;
        this.playerId = playerId;
    }
}

/**
 * Performs a Breadth-First Search (BFS) to find the shortest path between two points on the board.
 * @param board The current game board.
 * @param startX Starting X coordinate.
 * @param startY Starting Y coordinate.
 * @param targetX Target X coordinate.
 * @param targetY Target Y coordinate.
 * @param maxSteps Maximum allowed steps for the path.
 * @returns An array of Directions representing the path, or null if no path is found within maxSteps.
 */
function findPath(
    board: Tile[][],
    startX: number, startY: number,
    targetX: number, targetY: number,
    maxSteps: number
): Direction[] | null {
    const queue: { x: number, y: number, path: Direction[] }[] = [];
    const visited = new Set<string>(); // Stores "x,y" strings to prevent cycles and redundant visits

    queue.push({ x: startX, y: startY, path: [] });
    visited.add(`${startX},${startY}`);

    while (queue.length > 0) {
        const { x, y, path } = queue.shift()!;

        // If current position is the target, we found a path
        if (x === targetX && y === targetY) {
            return path;
        }

        // If path length exceeds max steps, stop exploring this path
        if (path.length >= maxSteps) {
            continue;
        }

        const currentTile = board[y][x];

        // Define possible moves and their corresponding connection requirements
        const moves = [
            { dx: 0, dy: -1, dir: Direction.UP, currentConn: Direction.UP, nextConn: Direction.DOWN },
            { dx: 1, dy: 0, dir: Direction.RIGHT, currentConn: Direction.RIGHT, nextConn: Direction.LEFT },
            { dx: 0, dy: 1, dir: Direction.DOWN, currentConn: Direction.DOWN, nextConn: Direction.UP },
            { dx: -1, dy: 0, dir: Direction.LEFT, currentConn: Direction.LEFT, nextConn: Direction.RIGHT }
        ];

        for (const move of moves) {
            const nextX = x + move.dx;
            const nextY = y + move.dy;

            // Check bounds
            if (nextX >= 0 && nextX < BOARD_SIZE && nextY >= 0 && nextY < BOARD_SIZE) {
                const nextTile = board[nextY][nextX];
                // Check if paths connect between current and next tile
                if (currentTile.canConnect(move.currentConn, nextTile, move.nextConn)) {
                    if (!visited.has(`${nextX},${nextY}`)) {
                        visited.add(`${nextX},${nextY}`);
                        queue.push({ x: nextX, y: nextY, path: [...path, move.dir] });
                    }
                }
            }
        }
    }
    return null; // No path found within maxSteps
}

/**
 * Simulates a push operation on the board and returns the new board state,
 * player's new position, and the tile pushed out.
 * @param originalBoard The board before the push.
 * @param playerInfo Current player information.
 * @param pushId Row or column index to push.
 * @param pushDirection Direction of the push (UP/DOWN/LEFT/RIGHT).
 * @returns An object containing the new board, player's new X, Y coordinates, and the string of the tile pushed out.
 */
function simulatePush(
    originalBoard: Tile[][],
    playerInfo: PlayerInfo,
    pushId: number,
    pushDirection: Direction
): { newBoard: Tile[][], newPlayerX: number, newPlayerY: number, newPlayerTile: string } {
    // Create a deep copy of the board to simulate the push without modifying the original
    const newBoard: Tile[][] = originalBoard.map(row => row.map(tile => new Tile(tile.originalTileString, tile.item)));
    let newPlayerX = playerInfo.x;
    let newPlayerY = playerInfo.y;
    let tileToInsert = new Tile(playerInfo.tileString); // The tile held by the player
    let pushedOutTile: Tile; // To store the tile that gets pushed off the board

    if (pushDirection === Direction.UP || pushDirection === Direction.DOWN) { // Column push
        const col = pushId;
        if (pushDirection === Direction.UP) {
            pushedOutTile = newBoard[0][col]; // Tile at top of column is pushed out
            for (let r = 0; r < BOARD_SIZE - 1; r++) {
                newBoard[r][col] = newBoard[r + 1][col]; // Shift tiles up
            }
            newBoard[BOARD_SIZE - 1][col] = tileToInsert; // Insert player's tile at bottom

            // Update player's position if they were in this column
            if (playerInfo.x === col) {
                if (playerInfo.y === 0) newPlayerY = BOARD_SIZE - 1; // Player warped to other end
                else newPlayerY--; // Player shifted up
            }
        } else { // DOWN
            pushedOutTile = newBoard[BOARD_SIZE - 1][col]; // Tile at bottom of column is pushed out
            for (let r = BOARD_SIZE - 1; r > 0; r--) {
                newBoard[r][col] = newBoard[r - 1][col]; // Shift tiles down
            }
            newBoard[0][col] = tileToInsert; // Insert player's tile at top

            // Update player's position
            if (playerInfo.x === col) {
                if (playerInfo.y === BOARD_SIZE - 1) newPlayerY = 0; // Player warped
                else newPlayerY++; // Player shifted down
            }
        }
    } else { // Row push (LEFT or RIGHT)
        const row = pushId;
        if (pushDirection === Direction.LEFT) {
            pushedOutTile = newBoard[row][0]; // Tile at left of row is pushed out
            for (let c = 0; c < BOARD_SIZE - 1; c++) {
                newBoard[row][c] = newBoard[row][c + 1]; // Shift tiles left
            }
            newBoard[row][BOARD_SIZE - 1] = tileToInsert; // Insert player's tile at right

            // Update player's position
            if (playerInfo.y === row) {
                if (playerInfo.x === 0) newPlayerX = BOARD_SIZE - 1; // Player warped
                else newPlayerX--; // Player shifted left
            }
        } else { // RIGHT
            pushedOutTile = newBoard[row][BOARD_SIZE - 1]; // Tile at right of row is pushed out
            for (let c = BOARD_SIZE - 1; c > 0; c--) {
                newBoard[row][c] = newBoard[row][c - 1]; // Shift tiles right
            }
            newBoard[row][0] = tileToInsert; // Insert player's tile at left

            // Update player's position
            if (playerInfo.y === row) {
                if (playerInfo.x === BOARD_SIZE - 1) newPlayerX = 0; // Player warped
                else newPlayerX++; // Player shifted right
            }
        }
    }
    return {
        newBoard: newBoard,
        newPlayerX: newPlayerX,
        newPlayerY: newPlayerY,
        newPlayerTile: pushedOutTile.originalTileString // The tile that was pushed out becomes the player's new held tile
    };
}

// Main game loop
while (true) {
    const turnType: number = parseInt(readline()); // 0 for PUSH, 1 for MOVE

    // Read board tile strings first
    const initialTileStrings: string[][] = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        initialTileStrings.push(readline().split(' '));
    }

    // Read player info
    const myPlayerInput = readline().split(' ');
    // Player's held tile string is read on a separate line immediately after player's X, Y
    const myPlayer = new PlayerInfo(0, parseInt(myPlayerInput[0]), parseInt(myPlayerInput[1]), parseInt(myPlayerInput[2]), readline()); 
    const oppPlayerInput = readline().split(' ');
    const oppPlayer = new PlayerInfo(1, parseInt(oppPlayerInput[0]), parseInt(oppPlayerInput[1]), parseInt(oppPlayerInput[2]), readline()); 

    // Read item info
    const numItems: number = parseInt(readline());
    const items: Item[] = [];
    for (let i = 0; i < numItems; i++) {
        const itemLine = readline().split(' ');
        items.push(new Item(itemLine[0], parseInt(itemLine[1]), parseInt(itemLine[2]), parseInt(itemLine[3])));
    }

    // Read quest info
    const numQuests: number = parseInt(readline());
    const quests: Quest[] = [];
    for (let i = 0; i < numQuests; i++) {
        const questLine = readline().split(' ');
        quests.push(new Quest(questLine[0], parseInt(questLine[1])));
    }

    // Construct the board with items on their respective tiles
    const boardWithItems: Tile[][] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        boardWithItems.push([]);
        for (let c = 0; c < BOARD_SIZE; c++) {
            const tileStr = initialTileStrings[r][c];
            let itemOnTile: Item | null = null;
            // Find if any item is at this board coordinate
            for (const item of items) {
                if (item.x === c && item.y === r) {
                    itemOnTile = item;
                    break;
                }
            }
            boardWithItems[r].push(new Tile(tileStr, itemOnTile));
        }
    }
    
    // For Wood 4 league, there's always 1 quest for player 0, and the item is on the board.
    const myQuest = quests.find(q => q.playerId === 0)!;
    const targetItem = items.find(item => item.name === myQuest.itemName && item.playerId === 0)!; // Find the item corresponding to my quest
    const targetX = targetItem.x;
    const targetY = targetItem.y;

    if (turnType === 0) { // PUSH turn
        let bestPathLength = Infinity;
        let bestPush: { id: number, direction: Direction } | null = null;

        const possiblePushes: { id: number, direction: Direction }[] = [];
        // Generate all 28 possible push actions (7 rows/columns * 2 directions each)
        for (let i = 0; i < BOARD_SIZE; i++) {
            possiblePushes.push({ id: i, direction: Direction.UP });
            possiblePushes.push({ id: i, direction: Direction.DOWN });
            possiblePushes.push({ id: i, direction: Direction.LEFT });
            possiblePushes.push({ id: i, direction: Direction.RIGHT });
        }

        // Iterate through all possible pushes and simulate each to find the best one
        for (const push of possiblePushes) {
            const { newBoard, newPlayerX, newPlayerY } = simulatePush(boardWithItems, myPlayer, push.id, push.direction);
            
            // Check if player lands on target tile immediately after the push (0 steps to quest completion)
            if (newPlayerX === targetX && newPlayerY === targetY) {
                bestPathLength = 0;
                bestPush = push;
                break; // Found an optimal push, no need to check further
            }

            // Find the path to the target on the simulated new board
            const path = findPath(newBoard, newPlayerX, newPlayerY, targetX, targetY, MAX_MOVES);
            if (path !== null) {
                // If a path is found and it's shorter than the current best, update bestPush
                if (path.length < bestPathLength) {
                    bestPathLength = path.length;
                    bestPush = push;
                }
            }
        }

        if (bestPush) {
            // Execute the best push found
            console.log(`PUSH ${bestPush.id} ${bestPush.direction}`);
        } else {
            // If no push leads to a path within MAX_MOVES, make a default valid push.
            // Pushing row 0 to the RIGHT is a simple, always valid fallback.
            console.log('PUSH 0 RIGHT');
        }

    } else { // MOVE turn
        // Find the shortest path from current player position to the target item on the current board
        const path = findPath(boardWithItems, myPlayer.x, myPlayer.y, targetX, targetY, MAX_MOVES);
        
        // If a path is found and it requires movement (length > 0)
        if (path && path.length > 0) {
            console.log(`MOVE ${path.join(' ')}`);
        } else {
            // If no path is found (null) or player is already on the target (empty path), then PASS.
            console.log('PASS');
        }
    }
}