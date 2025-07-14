/**
 * Reads a line from standard input. In a CodinGame environment, this function is usually provided.
 * @returns {string} The line read from input.
 */
declare function readline(): string;

/**
 * Prints a message to standard output. In a CodinGame environment, this function is usually provided.
 * @param {any} message The message to print.
 */
declare function print(message: any): void;

// Fallback for `print` if not globally defined (e.g., when testing locally outside CodinGame's environment)
if (typeof print === 'undefined') {
    var print = console.log;
}

// Read the number of participants
const N: number = parseInt(readline());

// Read the price of the gift
const C: number = parseInt(readline());

// Read the list of budgets for each participant
const budgets: number[] = [];
for (let i = 0; i < N; i++) {
    budgets.push(parseInt(readline()));
}

// 1. Sort the budgets in ascending order.
// This is crucial for applying the fairness rules correctly, processing participants
// from those with the smallest maximum budgets to those with the largest.
budgets.sort((a, b) => a - b);

// 2. Calculate the total sum of all budgets to check initial feasibility.
let totalBudgetSum: number = 0;
for (const budget of budgets) {
    totalBudgetSum += budget;
}

// Check if the total available budget is sufficient to buy the gift.
if (totalBudgetSum < C) {
    // If not, it's impossible.
    print("IMPOSSIBLE");
} else {
    // Initialize an array to store the calculated payment for each participant.
    // The order of elements in `payments` will correspond to the sorted `budgets` order.
    const payments: number[] = new Array(N);

    let remainingCost: number = C; // The portion of the gift price that still needs to be covered.
    let numRemainingParticipants: number = N; // The number of participants whose contributions are yet to be determined.

    // Iterate through the sorted budgets.
    for (let i = 0; i < N; i++) {
        const currentBudget = budgets[i];

        // Calculate the "ideal" average payment if the `remainingCost` were to be split
        // equally among the `numRemainingParticipants`. We use a float for this comparison.
        const idealAveragePayment = remainingCost / numRemainingParticipants;

        // Rule: "no Pilipiu can pay more than his maximum budget"
        // If the current participant's budget is less than or equal to the ideal average,
        // this participant must pay their full budget, as they cannot even afford the average share.
        if (currentBudget <= idealAveragePayment) {
            payments[i] = currentBudget;      // Assign the participant their full budget.
            remainingCost -= currentBudget;   // Reduce the remaining cost.
            numRemainingParticipants--;       // Reduce the count of participants needing to contribute.
        } else {
            // Rule: "the optimal solution is the one for which the highest contribution is minimal"
            // If the current participant's budget is greater than the ideal average,
            // it implies that all `numRemainingParticipants` (from current index `i` to `N-1`)
            // have budgets sufficient to cover at least the `idealAveragePayment`.
            // At this point, we can distribute the `remainingCost` among these `numRemainingParticipants`
            // as evenly as possible to minimize the maximum contribution.

            // Calculate the base payment each of the remaining participants will pay.
            const basePayment = Math.floor(remainingCost / numRemainingParticipants);
            // Calculate how many participants will need to pay an additional 1 unit
            // due to the remainder from integer division.
            const remainder = remainingCost % numRemainingParticipants;

            // Distribute `basePayment` and `basePayment + 1` among the remaining participants.
            // To satisfy the "lexicographically smallest sorted contributions" rule,
            // the `basePayment` is assigned to the 'earlier' participants in the remaining group
            // (those with relatively smaller budgets), and `basePayment + 1` is assigned to
            // the 'later' participants (those with relatively larger budgets).
            for (let j = 0; j < numRemainingParticipants; j++) {
                if (j < numRemainingParticipants - remainder) {
                    // These participants pay the base amount.
                    payments[i + j] = basePayment;
                } else {
                    // These participants pay base amount + 1.
                    payments[i + j] = basePayment + 1;
                }
            }
            // All remaining payments have been determined, so we can stop processing.
            break;
        }
    }

    // Print the calculated payments.
    // Since `payments` was filled based on `sortedBudgets` and the distribution logic,
    // the `payments` array itself will be sorted in ascending order, satisfying the output requirement.
    for (const payment of payments) {
        print(payment);
    }
}