/**
 * In the TypeScript template, readline() and console.log() are globally available.
 * No need to import anything specific.
 */

// Define Direction and DIRECTIONS_MAP globally for easy access
enum Direction {
    N = 0, NE = 1, E = 2, SE = 3, S = 4, SW = 5, W = 6, NW = 7
}

const DIRECTIONS_MAP: Record<string, { dx: number, dy: number }> = {
    "N": { dx: -1, dy: 0 },
    "NE": { dx: -1, dy: 1 },
    "E": { dx: 0, dy: 1 },
    "SE": { dx: 1, dy: 1 },
    "S": { dx: 1, dy: 0 },
    "SW": { dx: 1, dy: -1 },
    "W": { dx: 0, dy: -1 },
    "NW": { dx: -1, dy: -1 },
};

/**
 * Represents a single action (MOVE&BUILD) available to a unit.
 */
class Action {
    type: string; // Always "MOVE&BUILD" for this league
    unitIndex: number; // Always 0 for this league
    moveDir: string;
    buildDir: string;

    // Pre-calculated deltas for move and build directions
    moveDx: number;
    moveDy: number;
    buildDx: number;
    buildDy: number;

    constructor(type: string, index: number, dir1: string, dir2: string) {
        this.type = type;
        this.unitIndex = index;
        this.moveDir = dir1;
        this.buildDir = dir2;
        this.moveDx = DIRECTIONS_MAP[dir1].dx;
        this.moveDy = DIRECTIONS_MAP[dir1].dy;
        this.buildDx = DIRECTIONS_MAP[dir2].dx;
        this.buildDy = DIRECTIONS_MAP[dir2].dy;
    }
}

// Global variables for game parameters, initialized once
let size: number;
let unitsPerPlayer: number;

/**
 * Calculates a score for a given action based on the current game state.
 * The higher the score, the more desirable the action.
 * @param action The action to evaluate.
 * @param myUnit My unit's current position.
 * @param oppUnit Opponent's unit's current position.
 * @param board The current game board (heights of cells).
 * @returns A numerical score for the action.
 */
function calculateActionScore(
    action: Action,
    myUnit: { x: number, y: number },
    oppUnit: { x: number, y: number },
    board: number[][],
): number {
    let score = 0;

    // Calculate the new position of my unit after the move
    const newMyX = myUnit.x + action.moveDx;
    const newMyY = myUnit.y + action.moveDy;

    // Defensive checks (should not be strictly necessary if legalActions are always valid)
    if (newMyX < 0 || newMyX >= size || newMyY < 0 || newMyY >= size || board[newMyY][newMyX] === -1) {
        return -Infinity; // Moving to an invalid spot (hole or out of bounds)
    }

    const currentMyHeight = board[myUnit.y][myUnit.x];
    const newMyHeight = board[newMyY][newMyX];

    // Calculate the position where the unit will build
    const buildX = newMyX + action.buildDx;
    const buildY = newMyY + action.buildDy;

    // Defensive checks for build spot
    if (buildX < 0 || buildX >= size || buildY < 0 || buildY >= size || board[buildY][buildX] === -1) {
        return -1000; // Cannot build on a hole or outside grid
    }

    const currentBuildHeight = board[buildY][buildX];

    // Simulate the height of the built cell after the action
    const simulatedBuildHeight = (currentBuildHeight !== -1 && currentBuildHeight < 4) ? currentBuildHeight + 1 : currentBuildHeight;

    // --- Scoring Logic ---

    // Priority 1: Set up a win for my next turn
    // If building makes a cell height 3, and it's reachable by me, it's a great spot for next turn.
    if (currentBuildHeight === 2 && simulatedBuildHeight === 3) {
        score += 200; // Very high score for creating a winning path
    }

    // Priority 2: Deny Opponent a win spot
    // Check if opponent is visible (not -1 -1)
    const isOpponentVisible = oppUnit.x !== -1;
    // Check if the cell being built is adjacent to the opponent
    const isBuildCellAdjacentToOpponent = isOpponentVisible && Math.max(Math.abs(buildX - oppUnit.x), Math.abs(buildY - oppUnit.y)) <= 1;

    // If I build a height 3 cell to height 4 (removing it) AND it's next to the opponent, it's good.
    if (currentBuildHeight === 3 && simulatedBuildHeight === 4 && isBuildCellAdjacentToOpponent) {
        score += 150; // High score for denying opponent a potential win
    }

    // Priority 3: Increase my unit's height
    // Reward moving upwards.
    score += (newMyHeight - currentMyHeight) * 10; // 10 points for each level climbed

    // Priority 4: General preference for being on higher ground
    // Being on a higher cell gives more options and safety.
    score += newMyHeight * 5;

    // Priority 5: General building progress
    // Reward building cells to useful heights (1 or 2).
    if (currentBuildHeight === 1 && simulatedBuildHeight === 2) {
        score += 50; // Building to height 2
    } else if (currentBuildHeight === 0 && simulatedBuildHeight === 1) {
        score += 25; // Building to height 1
    }

    // Penalty for building a height 3 cell to 4 if it's NOT blocking the opponent.
    // This removes a potentially useful cell from the board without immediate benefit.
    if (currentBuildHeight === 3 && simulatedBuildHeight === 4 && !isBuildCellAdjacentToOpponent) {
        score -= 10; // Small penalty
    }

    return score;
}

// --- Main Game Loop ---

// Initialization Input: Read grid size and units per player (always 1 for this league)
size = parseInt(readline());
unitsPerPlayer = parseInt(readline());

// Game Loop: Runs for each turn
while (true) {
    // Read current grid state
    const board: number[][] = [];
    for (let i = 0; i < size; i++) {
        const row = readline().split('');
        // Store '.' as -1 to represent unplayable holes
        board.push(row.map(cell => cell === '.' ? -1 : parseInt(cell)));
    }

    // Read my unit(s) position(s)
    const myUnits: { x: number, y: number }[] = [];
    for (let i = 0; i < unitsPerPlayer; i++) {
        const [unitY, unitX] = readline().split(' ').map(Number);
        myUnits.push({ x: unitX, y: unitY }); // Store as {x, y} for easier indexing
    }

    // Read opponent unit(s) position(s)
    const oppUnits: { x: number, y: number }[] = [];
    for (let i = 0; i < unitsPerPlayer; i++) {
        const [unitY, unitX] = readline().split(' ').map(Number);
        oppUnits.push({ x: unitX, y: unitY }); // Store as {x, y}
    }

    // Read number of legal actions and then the actions themselves
    const legalActionsCount = parseInt(readline());
    const legalActions: Action[] = [];
    for (let i = 0; i < legalActionsCount; i++) {
        const [atype, index, dir1, dir2] = readline().split(' ');
        legalActions.push(new Action(atype, parseInt(index), dir1, dir2));
    }

    // For Wood league, we only have one unit at index 0.
    const myUnit = myUnits[0];
    const oppUnit = oppUnits[0];

    let bestAction: Action | null = null;
    let maxScore = -Infinity;

    // Iterate through all legal actions to find the best one
    for (const action of legalActions) {
        const newMyX = myUnit.x + action.moveDx;
        const newMyY = myUnit.y + action.moveDy;

        // First, check for an immediate winning move (moving onto a height 3 cell)
        if (board[newMyY][newMyX] === 3) {
            bestAction = action;
            break; // Found a winning move, no need to check further, execute it!
        }

        // If not an immediate win, calculate the action's score using the heuristic
        const currentActionScore = calculateActionScore(action, myUnit, oppUnit, board);

        // Update best action if current action has a higher score
        if (currentActionScore > maxScore) {
            maxScore = currentActionScore;
            bestAction = action;
        }
    }

    // Output the chosen action
    if (bestAction) {
        console.log(`${bestAction.type} ${bestAction.unitIndex} ${bestAction.moveDir} ${bestAction.buildDir}`);
    } else {
        // Fallback: This block should ideally not be reached if legalActions is non-empty.
        // If it is reached, it implies no action was chosen (e.g., all had -Infinity score or legalActions was empty).
        // To prevent timeout and losing, pick the first legal action as a last resort.
        // This usually means the bot is in a very bad state.
        if (legalActions.length > 0) {
            console.log(`${legalActions[0].type} ${legalActions[0].unitIndex} ${legalActions[0].moveDir} ${legalActions[0].buildDir}`);
        } else {
            // No legal actions at all, indicates a loss condition.
            // In a real game, this means the player has no moves left.
            console.error("No legal actions available. Game over for this bot.");
            // A dummy action might be needed if the environment requires output even when no moves.
            // For example: console.log("MOVE&BUILD 0 N N");
        }
    }
}