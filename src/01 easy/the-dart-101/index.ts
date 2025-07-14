/**
 * Reads a line from standard input. In a CodinGame environment, this function
 * is usually provided globally. For local development, you'd mock this or use Node.js's readline.
 */
declare function readline(): string;

/**
 * Outputs a string to standard output, followed by a newline.
 * In the CodinGame IDE, `print()` is available.
 */
declare function print(message: any): void;


/**
 * Simulates the dart game for a single player according to the specified rules.
 * @param playerShoots An array of strings representing the player's darts (e.g., "10", "2*19", "X").
 * @returns An object containing the final score and the number of rounds played to reach it (or not).
 */
function simulatePlayer(playerShoots: string[]): { rounds: number; score: number } {
    let totalScore = 0;
    let roundsPlayed = 0;
    let currentShootIndex = 0;

    // Loop until player wins (score 101) or runs out of darts to throw
    while (totalScore !== 101 && currentShootIndex < playerShoots.length) {
        roundsPlayed++;
        let roundScoreAccumulator = 0; // Points accumulated in the current round
        let consecutiveMissesInRound = 0; // Counts consecutive 'X's in the current round
        let missesCountInRound = 0;      // Total 'X's in the current round
        const scoreBeforeThisRound = totalScore; // Store current total score for revert rule
        let roundEndedEarlyDueToSpecialCondition = false; // Flag for early round termination

        // Loop for up to 3 darts in the current round
        for (let i = 0; i < 3; i++) {
            if (currentShootIndex >= playerShoots.length) {
                // Player ran out of darts for the game
                break;
            }

            const dart = playerShoots[currentShootIndex];
            currentShootIndex++; // Move to the next dart for the next iteration/round

            if (dart === 'X') {
                missesCountInRound++;
                consecutiveMissesInRound++;
                roundScoreAccumulator -= 20; // Base penalty for a miss

                if (consecutiveMissesInRound === 2) {
                    roundScoreAccumulator -= 10; // Additional penalty for consecutive misses
                }

                if (missesCountInRound === 3) {
                    totalScore = 0; // Reset total score to 0 due to three misses
                    roundEndedEarlyDueToSpecialCondition = true; // Mark round as ended early
                    break; // Round ends immediately
                }
            } else {
                consecutiveMissesInRound = 0; // Reset consecutive misses on a hit
                const parts = dart.split('*');
                let value: number;
                if (parts.length === 2) {
                    // It's a multiplier shot (e.g., "2*19", "3*18")
                    value = parseInt(parts[0]) * parseInt(parts[1]);
                } else {
                    // It's a single value shot (e.g., "10", "20")
                    value = parseInt(parts[0]);
                }
                roundScoreAccumulator += value;
            }

            // After each dart, check the potential total score based on score BEFORE this round
            // plus the points accumulated in the current round.
            const potentialTotalScoreAfterThisDart = scoreBeforeThisRound + roundScoreAccumulator;

            if (potentialTotalScoreAfterThisDart === 101) {
                totalScore = 101; // Exactly 101, player wins!
                // Game for this player ends, return immediately.
                return { rounds: roundsPlayed, score: totalScore };
            } else if (potentialTotalScoreAfterThisDart > 101) {
                totalScore = scoreBeforeThisRound; // Revert to score before this round
                roundEndedEarlyDueToSpecialCondition = true; // Mark round as ended early
                break; // Round ends immediately
            }
            // If neither 101 nor >101, continue to the next dart or end of the round naturally.
        }

        // End of round processing:
        // Only apply the accumulated round score to the total score if the round
        // did NOT end early due to a reset (3 misses) or revert (exceeding 101).
        if (!roundEndedEarlyDueToSpecialCondition) {
            totalScore = scoreBeforeThisRound + roundScoreAccumulator;
        }
        // If it ended early, totalScore was already adjusted (reset to 0 or reverted to scoreBeforeThisRound),
        // and the roundScoreAccumulator is effectively discarded for that round.
    }

    // Return the final state if the player didn't reach 101 (e.g., ran out of darts)
    return { rounds: roundsPlayed, score: totalScore };
}

// --- Main Program Execution ---

// Read the number of players
const N: number = parseInt(readline());

// Read player names
const playerNames: string[] = [];
for (let i = 0; i < N; i++) {
    playerNames.push(readline());
}

// Read player shoots (each line is a space-separated string of darts)
const playerShootsStrings: string[][] = [];
for (let i = 0; i < N; i++) {
    playerShootsStrings.push(readline().split(' '));
}

let winnerName: string | null = null;
let minRounds = Infinity; // Initialize with a very high number of rounds

// Simulate the game for each player
for (let i = 0; i < N; i++) {
    const name = playerNames[i];
    const shoots = playerShootsStrings[i];

    const result = simulatePlayer(shoots);

    // Check if this player won (reached exactly 101)
    if (result.score === 101) {
        // If they won, check if they did it in fewer rounds than the current best
        if (result.rounds < minRounds) {
            minRounds = result.rounds;
            winnerName = name;
        }
    }
}

// Print the name of the winner
print(winnerName);