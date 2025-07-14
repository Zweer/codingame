/**
 * Auto-generated code below contains the mechanism to read input and create output.
 * You should use readline() to read input and console.log() to write output.
 **/

// Read the number of rounds the target will play
const ROUNDS: number = parseInt(readline());
// Read the initial amount of cash the target starts with
let currentCash: number = parseInt(readline());

// Loop through each round of the game
for (let i = 0; i < ROUNDS; i++) {
    // Read the input for the current round's play.
    // This string will contain the ball result, the call type, and optionally the specific number for PLAIN bets.
    const playLine: string[] = readline().split(' ');
    const BALL: number = parseInt(playLine[0]); // The number the roulette ball landed on
    const CALL: string = playLine[1]; // The target's bet type (EVEN, ODD, PLAIN)
    // If the call type is "PLAIN", there will be a third element which is the specific number chosen.
    const NUMBER: number | undefined = playLine.length === 3 ? parseInt(playLine[2]) : undefined;

    // Calculate the bet amount for this round.
    // It's 1/4 of the current cash, rounded up to the nearest integer.
    const bet: number = Math.ceil(currentCash / 4);

    // Immediately subtract the bet from the current cash.
    // If the target wins, this amount will be returned to them as part of the payout.
    currentCash -= bet;

    let won: boolean = false; // Flag to track if the target won this round
    let payoutMultiplier: number = 0; // The multiplier for winnings (1 for EVEN/ODD, 35 for PLAIN)

    // Determine the outcome of the bet based on the call type and ball result
    if (CALL === "EVEN") {
        // A bet on EVEN wins if the ball is an even number and is not 0.
        // 0 is considered even mathematically, but the problem states "non-zero".
        if (BALL !== 0 && BALL % 2 === 0) {
            won = true;
            payoutMultiplier = 1;
        }
    } else if (CALL === "ODD") {
        // A bet on ODD wins if the ball is an odd number.
        if (BALL % 2 !== 0) {
            won = true;
            payoutMultiplier = 1;
        }
    } else if (CALL === "PLAIN") {
        // A PLAIN bet wins if the ball result exactly matches the chosen number.
        if (BALL === NUMBER) {
            won = true;
            payoutMultiplier = 35;
        }
    }

    // If the target won the round, add the winnings to their cash.
    if (won) {
        // First, the original bet amount is returned.
        currentCash += bet;
        // Then, the additional winnings (bet multiplied by payout factor) are added.
        currentCash += bet * payoutMultiplier;
    }
    // If the target lost, no further action is needed as the bet was already subtracted.
}

// After all rounds are played, output the target's final cash amount.
console.log(currentCash);