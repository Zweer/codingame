// Helper function to read input from CodinGame's environment
// This declaration is typically added for local TypeScript development or type checking.
// In the actual CodinGame environment, `readline` is globally available.
declare function readline(): string;

// Main function to encapsulate the game logic
function solve() {
    // 1. Initialization Phase: Read cell information (richness)
    // Create a Map to store the richness of each cell, indexed by its cellIndex.
    const cells: Map<number, number> = new Map();
    const numberOfCells: number = parseInt(readline());

    for (let i = 0; i < numberOfCells; i++) {
        const inputs: string[] = readline().split(' ');
        const cellIndex: number = parseInt(inputs[0]);
        const richness: number = parseInt(inputs[1]);
        // The remaining 6 inputs (neigh0 to neigh5) are neighbor indices,
        // which are ignored in the Wood 4 league.
        cells.set(cellIndex, richness);
    }

    // 2. Game Loop: This loop runs for each turn of the game.
    while (true) {
        // Read global game state for the current turn
        const day: number = parseInt(readline()); // Always 0 in Wood 4 league
        const nutrients: number = parseInt(readline());

        // Read player's (my) state
        const [mySun, myScore] = readline().split(' ').map(Number);

        // Read opponent's state
        const [oppSun, oppScore, oppIsWaiting] = readline().split(' ').map(Number);
        // oppIsWaiting is ignored for this basic strategy in Wood 4.

        // Read tree information
        const numberOfTrees: number = parseInt(readline());
        // Store only our size 3 trees, as these are the only ones we can COMPLETE in Wood 4.
        const mySize3Trees: { cellIndex: number; richness: number }[] = [];

        for (let i = 0; i < numberOfTrees; i++) {
            const inputs: string[] = readline().split(' ');
            const cellIndex: number = parseInt(inputs[0]);
            const size: number = parseInt(inputs[1]);
            const isMine: number = parseInt(inputs[2]); // 1 if owned by me, 0 otherwise
            // isDormant is ignored in Wood 4.

            if (isMine === 1 && size === 3) {
                // If it's my size 3 tree, add it to our list, including its richness.
                mySize3Trees.push({ cellIndex, richness: cells.get(cellIndex)! });
            }
        }

        // Read the list of possible actions for this turn.
        // For Wood 4, our decision logic doesn't strictly depend on this list,
        // as the conditions for "COMPLETE" are simple (4 sun points, own size 3 tree).
        // We just need to consume these lines from the input.
        const numberOfPossibleActions: number = parseInt(readline());
        for (let i = 0; i < numberOfPossibleActions; i++) {
            readline(); // Discard the action strings.
        }

        let bestAction: string = "WAIT"; // Default action if no better one is found
        let maxPotentialPoints: number = -1; // Tracks the maximum points achievable by completing a tree
        let bestTreeCellIndex: number = -1; // Stores the cell index of the tree that yields max points

        // Decision Logic: Try to find the most profitable COMPLETE action.
        // We can only COMPLETE if we have at least 4 sun points.
        if (mySun >= 4) {
            for (const tree of mySize3Trees) {
                let richnessBonus = 0;
                // Determine the bonus points based on cell richness.
                if (tree.richness === 2) {
                    richnessBonus = 2;
                } else if (tree.richness === 3) {
                    richnessBonus = 4;
                }

                // Calculate the total potential points for completing this tree.
                const currentPotentialPoints = nutrients + richnessBonus;

                // If this tree offers more points than any previously considered tree,
                // or if it's the first tree we're considering, select it as the best.
                if (currentPotentialPoints > maxPotentialPoints) {
                    maxPotentialPoints = currentPotentialPoints;
                    bestTreeCellIndex = tree.cellIndex;
                }
            }
        }

        // If we found a size 3 tree that we can afford and decided is the best to complete,
        // set the action to COMPLETE it. Otherwise, remain with the default WAIT action.
        if (bestTreeCellIndex !== -1) {
            bestAction = `COMPLETE ${bestTreeCellIndex}`;
        }

        // Output the chosen action to the game engine.
        console.log(bestAction);
    }
}

// Call the solve function to start the game logic.
solve();