// Required for CodinGame environment to read input
declare function readline(): string;
declare function print(message: any): void;

// Read N (number of initial piles)
const N: number = parseInt(readline());

// Read C (initial card counts)
let currentPiles: number[] = readline().split(' ').map(Number);

// Map to store seen configurations and the turn number they first appeared.
// Key: string representation of sorted non-zero piles (e.g., "1,2,3").
// Value: turn number when this configuration was first observed.
const seenConfigurations: Map<string, number> = new Map();

let turnCount: number = 0;

while (true) {
    // Step 1: Standardize the current configuration for unique identification.
    // 1. Filter out piles with 0 cards (as they are ignored).
    // 2. Sort the remaining pile sizes in ascending order (order is not important).
    // 3. Join them into a comma-separated string to use as a map key.
    const normalizedConfig: string = currentPiles
        .filter(pile => pile > 0)
        .sort((a, b) => a - b)
        .join(',');

    // Step 2: Check if this configuration has been seen before.
    if (seenConfigurations.has(normalizedConfig)) {
        // If it has, a loop is detected.
        // The loop length is the current turn number minus the turn number
        // when this configuration was first observed.
        const previousTurn = seenConfigurations.get(normalizedConfig)!;
        print(turnCount - previousTurn);
        break; // Loop found, exit the simulation.
    } else {
        // If this is a new configuration, add it to our map with the current turnCount.
        seenConfigurations.set(normalizedConfig, turnCount);
    }

    // Step 3: Perform one turn of Bulgarian solitaire to get the next configuration.
    let cardsTaken: number = 0;
    const nextPiles: number[] = [];

    // Iterate through current piles to take one card from each non-empty pile.
    for (const pileSize of currentPiles) {
        if (pileSize > 0) {
            nextPiles.push(pileSize - 1); // Remaining cards in this pile
            cardsTaken++; // Count cards taken for the new pile
        }
    }

    // Create a new pile with the collected cards.
    nextPiles.push(cardsTaken);

    // Update currentPiles to the configuration after this turn.
    currentPiles = nextPiles;

    // Increment the turn counter for the next iteration.
    turnCount++;
}