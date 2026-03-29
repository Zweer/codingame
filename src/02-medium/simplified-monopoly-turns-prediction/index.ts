// Required for CodinGame environment
declare function readline(): string;
// declare function print(message: any): void; // Using console.log is usually fine for output

// Define constants for board positions
const BOARD_SIZE = 40;
const JAIL_POSITION = 10;
const GO_TO_JAIL_POSITION = 30;

// Interface to represent a player's state
interface Player {
    name: string;
    position: number;
    inJail: boolean;
    jailTurnsCount: number; // Counts how many turns they've spent *in jail* trying to get out. Max 3.
    consecutiveDoubles: number; // Counts consecutive doubles *in a single turn while not in jail*. Max 3.
    originalOrder: number; // To preserve output order as per problem statement
}

// --- Input Reading ---

// Read the number of players
const P: number = parseInt(readline());

// Read player details and initialize player objects
const players: Player[] = [];
for (let i = 0; i < P; i++) {
    const [name, posStr] = readline().split(' ');
    players.push({
        name: name,
        position: parseInt(posStr),
        inJail: false, // Players never start in jail as per constraints
        jailTurnsCount: 0,
        consecutiveDoubles: 0,
        originalOrder: i, // Store original index for sorting later
    });
}

// Read the number of dice rolls
const D: number = parseInt(readline());

// Read dice rolls
const diceRolls: [number, number][] = [];
for (let i = 0; i < D; i++) {
    const [d1Str, d2Str] = readline().split(' ');
    diceRolls.push([parseInt(d1Str), parseInt(d2Str)]);
}

// Read and discard board position names (they are not needed for this puzzle)
for (let i = 0; i < BOARD_SIZE; i++) {
    readline();
}

// --- Game Simulation ---

let currentPlayerIndex = 0; // Index of the player whose turn it is

// Iterate through each dice roll provided
for (let i = 0; i < diceRolls.length; i++) {
    const [d1, d2] = diceRolls[i];
    const sum = d1 + d2;
    const isDouble = d1 === d2;

    const currentPlayer = players[currentPlayerIndex];

    let turnEnds = false; // Flag to determine if the current player's turn ends

    if (currentPlayer.inJail) {
        // Player is in Jail
        currentPlayer.jailTurnsCount++; // Increment jail turns spent

        if (isDouble || currentPlayer.jailTurnsCount === 3) {
            // Player gets out of jail: either by rolling a double or after 3 turns
            currentPlayer.inJail = false; // No longer in jail
            currentPlayer.jailTurnsCount = 0; // Reset jail turn counter

            // Move forward the sum of the dice rolled
            currentPlayer.position = (currentPlayer.position + sum) % BOARD_SIZE;
            
            // Turn ends even if a double freed them (specific jail rule)
            turnEnds = true;
        } else {
            // Player remains in jail, does not move
            turnEnds = true; // Turn ends, player stays in jail
        }
    } else {
        // Player is not in Jail (free)
        if (isDouble) {
            currentPlayer.consecutiveDoubles++; // Increment consecutive doubles count
            
            if (currentPlayer.consecutiveDoubles === 3) {
                // Three consecutive doubles: Go to Jail
                currentPlayer.position = JAIL_POSITION; // Move to Jail position
                currentPlayer.inJail = true; // Set inJail status
                currentPlayer.consecutiveDoubles = 0; // Reset doubles count
                currentPlayer.jailTurnsCount = 0; // Reset jail turns count for the new jail sentence
                turnEnds = true; // Turn ends
            } else {
                // Double rolled (but not third consecutive): Move and get another roll
                currentPlayer.position = (currentPlayer.position + sum) % BOARD_SIZE;
                
                if (currentPlayer.position === GO_TO_JAIL_POSITION) {
                    // Landed on "Go To Jail" square (position 30)
                    currentPlayer.position = JAIL_POSITION; // Move to Jail position
                    currentPlayer.inJail = true; // Set inJail status
                    currentPlayer.consecutiveDoubles = 0; // Reset doubles count (turn ends)
                    currentPlayer.jailTurnsCount = 0; // Reset jail turns count for the new jail sentence
                    turnEnds = true; // Turn ends
                }
                // If not Go To Jail and rolled a double (and not 3rd consecutive), turn does NOT end.
                // The loop will process the *next* dice roll for the *same* player.
            }
        } else {
            // Not a double: Regular move
            currentPlayer.consecutiveDoubles = 0; // Reset consecutive doubles count
            currentPlayer.position = (currentPlayer.position + sum) % BOARD_SIZE;
            
            if (currentPlayer.position === GO_TO_JAIL_POSITION) {
                // Landed on "Go To Jail" square (position 30)
                currentPlayer.position = JAIL_POSITION; // Move to Jail position
                currentPlayer.inJail = true; // Set inJail status
                currentPlayer.jailTurnsCount = 0; // Reset jail turns count for the new jail sentence
            }
            turnEnds = true; // Turn ends
        }
    }

    // If the turn ended for the current player, advance to the next player
    if (turnEnds) {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    }
}

// --- Output Results ---

// Sort players back to their original input order before printing
players.sort((a, b) => a.originalOrder - b.originalOrder);

// Print each player's name and their final position
for (const player of players) {
    console.log(`${player.name} ${player.position}`);
}