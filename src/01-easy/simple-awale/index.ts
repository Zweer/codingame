// Define readline and console.log for CodinGame environment
declare function readline(): string;
declare function print(...args: any[]): void; // CodinGame usually uses 'print' for output

function solve() {
    // Read input
    const opBowlsStr = readline();
    const myBowlsStr = readline();
    const num = parseInt(readline());

    // Parse input strings into number arrays
    // Each array will have 7 elements: bowls 0-5 and reserve 6
    const oppBowls: number[] = opBowlsStr.split(' ').map(Number);
    const myBowls: number[] = myBowlsStr.split(' ').map(Number);

    // Get grains from the chosen bowl and empty it
    let grainsInHand: number = myBowls[num];
    myBowls[num] = 0;

    // --- Simulation Logic ---

    // `currentPos` maps to a global index in the distribution path:
    // 0-5: myBowls[0-5]
    // 6: myBowls[6] (my reserve)
    // 7-12: oppBowls[0-5]
    // 13: oppBowls[6] (opponent's reserve, which is skipped)
    let currentPos: number = num; // Start at the chosen bowl's index.
                                // The first grain will be placed at currentPos + 1 (after increment).

    let replay: boolean = false;
    let finalBowlPos: number = -1; // Tracks the global position where the last grain was dropped.

    while (grainsInHand > 0) {
        currentPos++; // Move to the next bowl in the distribution path

        // Handle wrap-around from the end of the path to the beginning
        if (currentPos > 13) {
            currentPos = 0; // Wrap around to myBowls[0]
        }

        // Check if the current bowl is the opponent's reserve (global position 13)
        if (currentPos === 13) {
            // Skip this bowl: do not add a grain, and do not decrement grainsInHand.
            // The loop will continue to the next position (which will be 0 after next currentPos++ and wrap-around).
            continue; 
        }

        // Place a grain in the current bowl based on its global position
        if (currentPos >= 0 && currentPos <= 6) {
            // It's one of my bowls (0-5) or my reserve (6)
            myBowls[currentPos]++;
        } else {
            // It's one of the opponent's bowls (7-12, which map to oppBowls[0-5])
            oppBowls[currentPos - 7]++; // Adjust index for oppBowls array
        }

        // Record the position where this grain was placed. This will be the final position
        // if this is the last grain.
        finalBowlPos = currentPos;
        grainsInHand--; // One grain has been placed
    }

    // --- Replay Condition Check ---
    // The player gets to play again if the very last grain landed in their own reserve.
    // My reserve is at global position 6.
    if (finalBowlPos === 6) {
        replay = true;
    }

    // --- Format and Print Output ---

    // Helper function to format a player's bowls
    const formatBowls = (bowls: number[]): string => {
        const regularBowls = bowls.slice(0, 6).join(' ');
        const reserveBowl = `[${bowls[6]}]`;
        return `${regularBowls} ${reserveBowl}`;
    };

    // Print opponent's bowls
    print(formatBowls(oppBowls));
    // Print my bowls
    print(formatBowls(myBowls));
    
    // Print REPLAY if applicable
    if (replay) {
        print("REPLAY");
    }
}

// Call the solve function to execute the puzzle logic
solve();