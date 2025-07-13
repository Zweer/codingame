/**
 * Reads a line from standard input. In CodinGame, this is provided by the environment.
 * For local testing, you might need to mock this function.
 */
declare function readline(): string;

/**
 * Prints a line to standard output. In CodinGame, this is how you send your commands.
 * For local testing, you might need to mock this function.
 */
declare function print(message: string): void;
declare function printErr(message: string): void; // For debugging output


// Global variables for game setup
let MY_PLAYER_ID: number;
let OPPONENT_PLAYER_ID: number;

// ADJACENCIES will store connections between fields.
// While not directly used in this simple AI for move generation,
// it's good practice to parse it in case a more complex AI is needed.
const ADJACENCIES = new Map<string, string[]>(); 

// MILLS: All 18 possible mill configurations on the Nine Men's Morris board.
// These are identified from the board image provided in the puzzle description,
// which shows only horizontal and vertical lines, not diagonals.
const MILLS: string[][] = [
    // Horizontal mills (3 on outer square, 3 on middle, 3 on inner)
    ["A1", "D1", "G1"], ["A4", "D4", "G4"], ["A7", "D7", "G7"], 
    ["B2", "D2", "F2"], ["B4", "D4", "F4"], ["B6", "D6", "F6"], 
    ["C3", "D3", "E3"], ["C4", "D4", "E4"], ["C5", "D5", "E5"], 
    // Vertical mills (3 on left side, 3 on middle, 3 on right side)
    ["A1", "A4", "A7"], ["D1", "D4", "D7"], ["G1", "G4", "G7"], 
    ["B2", "B4", "B6"], ["D2", "D4", "D6"], ["F2", "F4", "F6"], 
    ["C3", "C4", "C5"], ["D3", "D4", "D5"], ["E3", "E4", "E5"]  
];

// Type alias for board state: field name to player ID (0 or 1) or 2 for empty.
type BoardState = Map<string, number>; // 0: Player0, 1: Player1, 2: Empty

/**
 * Parses the board string provided by the game engine into a Map.
 * @param boardString The string representation of the board (e.g., "A1:2;D1:0;...").
 * @returns A Map where keys are field names and values are their states (0, 1, or 2).
 */
function parseBoard(boardString: string): BoardState {
    const board = new Map<string, number>();
    boardString.split(';').forEach(fieldState => {
        const [field, stateStr] = fieldState.split(':');
        board.set(field, parseInt(stateStr));
    });
    return board;
}

/**
 * Gets all fields currently occupied by a specific player.
 * @param board The current state of the board.
 * @param playerId The ID of the player (0 or 1).
 * @returns An array of field names occupied by the player.
 */
function getPlayerStones(board: BoardState, playerId: number): string[] {
    const stones: string[] = [];
    board.forEach((state, field) => {
        if (state === playerId) {
            stones.push(field);
        }
    });
    return stones;
}

/**
 * Checks if a given mill (3 fields) is occupied entirely by one player.
 * @param board The current state of the board.
 * @param player The ID of the player to check for.
 * @param mill An array of 3 field names representing a potential mill.
 * @returns True if the player occupies all three fields in the mill, false otherwise.
 */
function isMill(board: BoardState, player: number, mill: string[]): boolean {
    // A mill must have exactly 3 fields for this game.
    if (mill.length !== 3) {
        return false;
    }
    return mill.every(field => board.get(field) === player);
}

/**
 * Finds all mills currently formed by a specific player on the board.
 * @param board The current state of the board.
 * @param player The ID of the player to check for.
 * @returns An array of mill configurations (each a string array of 3 field names)
 *          that are currently formed by the player.
 */
function getMillsForPlayer(board: BoardState, player: number): string[][] {
    const playerMills: string[][] = [];
    for (const mill of MILLS) {
        if (isMill(board, player, mill)) {
            playerMills.push(mill);
        }
    }
    return playerMills;
}

/**
 * Checks if a specific field is part of any of the given mills.
 * @param field The field name to check.
 * @param mills An array of mill configurations (e.g., as returned by getMillsForPlayer).
 * @returns True if the field is part of at least one mill in the list, false otherwise.
 */
function isFieldInAnyMill(field: string, mills: string[][]): boolean {
    return mills.some(mill => mill.includes(field));
}

// --- Initialization Input Parsing ---
MY_PLAYER_ID = parseInt(readline());
OPPONENT_PLAYER_ID = 1 - MY_PLAYER_ID; // The other player's ID

const numberOfFields: number = parseInt(readline()); // This will always be 24 for Nine Men's Morris
// Parse the adjacency list for each field
for (let i = 0; i < numberOfFields; i++) {
    const neighborLine: string = readline();
    const [field, neighborsStr] = neighborLine.split(':');
    ADJACENCIES.set(field, neighborsStr.split(';'));
}

// --- Game Turn Loop ---
// This loop runs for every turn of the game.
while (true) {
    // Read opponent's last move (not used in this basic AI, but part of input protocol)
    const opMove: string = readline(); 
    // Read the current state of the board
    const boardStr: string = readline(); 
    // Read the number of valid commands available for this turn
    const numberOfValidCommands: number = parseInt(readline());

    // Parse the board string into a usable Map format
    const currentBoard = parseBoard(boardStr);
    
    // Get the actual number of stones each player has on the board.
    // This information (myStonesOnBoard, opponentStonesOnBoard) can be used
    // to determine the current game phase (placing, moving, flying) for more advanced AIs.
    // However, for this simple AI, we primarily rely on the provided valid commands.
    // const myStonesOnBoard = getPlayerStones(currentBoard, MY_PLAYER_ID).length;
    // const opponentStonesOnBoard = getPlayerStones(currentBoard, OPPONENT_PLAYER_ID).length;

    // Read all valid commands provided by the game engine for this turn
    const validCommands: string[] = [];
    for (let i = 0; i < numberOfValidCommands; i++) {
        validCommands.push(readline());
    }

    let chosenCommand: string | null = null;

    // First priority: Check for commands that allow taking an opponent's stone (forming a mill).
    // These commands are suffixed with "&TAKE".
    const captureCommands: { command: string; fieldToTake: string }[] = [];
    for (const cmd of validCommands) {
        if (cmd.startsWith("PLACE&TAKE") || cmd.startsWith("MOVE&TAKE")) {
            const parts = cmd.split(';');
            const fieldToTake = parts[parts.length - 1]; // The last part of the command is the field of the stone to take
            captureCommands.push({ command: cmd, fieldToTake });
        }
    }

    if (captureCommands.length > 0) {
        // If there are capture opportunities, we need to decide which stone to take.
        // Rules state: "The order to take a stone is first only opponents stones not connected in a mill.
        // When all opponent stones are connected in a mill, the player can take any stone from the opponent."
        // The `validCommands` input provided by the game engine *already respects this rule*.
        // This means, if there are non-mill stones to take, `captureCommands` will only contain options for those.
        // If all opponent stones are in mills, `captureCommands` will contain options for any of those mill stones.
        
        const opponentMills = getMillsForPlayer(currentBoard, OPPONENT_PLAYER_ID);

        // Try to find a capture command that targets a stone NOT currently part of an opponent's mill.
        // This is the optimal choice according to the rules and a basic heuristic.
        let bestCaptureCommand: string | null = null;
        for (const { command, fieldToTake } of captureCommands) {
            if (!isFieldInAnyMill(fieldToTake, opponentMills)) {
                bestCaptureCommand = command; // Found a non-mill stone to take.
                break; // Take this one, it's generally the most desirable target.
            }
        }

        if (bestCaptureCommand) {
            // Found a capture command targeting a non-mill stone. Use it.
            chosenCommand = bestCaptureCommand;
        } else {
            // No capture command targets a non-mill stone. This implies that all opponent stones
            // (or at least all valid targets provided by the engine) are currently in mills.
            // In this case, any of the available capture commands is valid according to the rules.
            // We simply pick the first one from the `captureCommands` list.
            chosenCommand = captureCommands[0].command;
        }
    } else {
        // No capture commands are available, meaning we cannot form a mill this turn.
        // In this scenario, we must make a regular placement or move.
        // For the Wood league, a simple strategy is to just pick the first valid command provided.
        // The problem guarantees at least one valid command is provided unless the game is over.
        chosenCommand = validCommands[0]; 
    }

    // Output the chosen command to the game engine
    print(chosenCommand);
}