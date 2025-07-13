The problem asks us to find the number of distinct checkout routes in darts for a given `score` using at most `darts` throws. Key rules are:
1.  **Dartboard Segments:** Singles (1-20, 25), Doubles (D1-D20, D25), Trebles (T1-T20). Each represents a unique throw type, even if they yield the same points (e.g., S12, D6, T4 all score 12 points but are distinct throws).
2.  **Checkout Condition:** The total sum of points must exactly equal the `score`.
3.  **Dart Count:** The total number of darts used must be less than or equal to `darts`.
4.  **Final Dart:** The very last dart of the checkout route **must** land in a Double segment (e.g., D1, D20, D25).
5.  **Throw Order:** The order of different dart types matters (e.g., `T5 D10 D10` and `D10 T5 D10` are distinct routes). Swapping identical darts (e.g., `D25 D25`) does not create a new route.

This problem can be efficiently solved using dynamic programming.

**1. Define Dart Throws:**
First, we enumerate all possible distinct dart throws. Each throw is characterized by its type (Single, Double, Treble) and its base value, which determines the points scored. Since the problem explicitly states that `S12`, `D6`, `T4` are distinct throws, we need to treat them as such when building sequences.


This generates 21 (Singles) + 21 (Doubles) + 20 (Trebles) = 62 distinct throw types.

**2. Dynamic Programming State:**
Let `dp[s][d]` be the number of ordered sequences of `d` darts that sum up to exactly `s` points. These intermediate darts can be of *any* type (Single, Double, or Treble), as the final dart rule only applies to the very last dart of the *checkout*.

The `dp` table will have dimensions `(MAX_SCORE_CONSTRAINT + 1)` by `(MAX_DARTS_CONSTRAINT + 1)`.
- `MAX_SCORE_CONSTRAINT` is 170.
- `MAX_DARTS_CONSTRAINT` is 5.

**3. DP Table Population:**
- **Base Case:** `dp[0][0] = 1`. This represents one way to achieve 0 points using 0 darts (by doing nothing).
- **Iteration:** We build up the `dp` table by iterating through the number of darts used (`d_used`) and the current score achieved (`s_current`).
    - For each `(s_current, d_used)` state where `dp[s_current][d_used]` is non-zero:
        - We consider adding any `dartThrow` from `allPossibleThrows`.
        - Let `points` be the score of `dartThrow`.
        - The `nextScore` will be `s_current + points`, and `nextDartsUsed` will be `d_used + 1`.
        - If `nextScore` and `nextDartsUsed` are within our table bounds, we add `dp[s_current][d_used]` to `dp[nextScore][nextDartsUsed]`.
        `dp[nextScore][nextDartsUsed] += dp[s_current][d_used];`
This process correctly counts ordered paths because each previous path `(dp[s_current][d_used])` is extended by a specific `dartThrow`. If two different sequences lead to `(s_current, d_used)`, they will each be extended by `dartThrow`, maintaining their distinctness. The rule about identical darts (`D25 D25`) is implicitly handled because we're adding "types" of throws sequentially; there's only one "D25" type.

**4. Calculating Total Checkout Routes:**
After filling the `dp` table, we need to apply the checkout-specific rules. A checkout must:
- Sum to the `score`.
- Use `k` darts, where `1 <= k <= darts`.
- The `k`-th dart must be a Double.

We iterate through all `finalDouble` throws (i.e., `D1` through `D25`). Let `doublePoints` be the points scored by this `finalDouble`.

- **Case A: Single-dart checkout (`k = 1`)**
    If `doublePoints === score` and `darts >= 1`, then this `finalDouble` itself is a valid checkout route. Increment `totalCheckoutRoutes`.

- **Case B: Multi-dart checkout (`k > 1`)**
    For each possible total number of darts `k` (from 2 up to `darts`):
    - We need `requiredPreviousScore = score - doublePoints`.
    - The number of darts before the final one is `dartsBeforeLast = k - 1`.
    - We look up `dp[requiredPreviousScore][dartsBeforeLast]`. This value represents all ordered ways to achieve `requiredPreviousScore` using `dartsBeforeLast` darts.
    - We add this value to `totalCheckoutRoutes`.
    `totalCheckoutRoutes += dp[requiredPreviousScore][dartsBeforeLast];`
    (Ensure `requiredPreviousScore` is non-negative and within table bounds.)

**Example Trace (score = 4, darts = 2):**
1.  **DP Table Population:**
    *   `dp[0][0] = 1`.
    *   After `d_used = 0` (calculating paths with 1 dart):
        *   `dp[1][1] = 1` (S1)
        *   `dp[2][1] = 2` (S2, D1)
        *   `dp[3][1] = 2` (S3, T1)
        *   `dp[4][1] = 2` (S4, D2)
        *   ...
    *   After `d_used = 1` (calculating paths with 2 darts):
        *   `dp[4][2]` will be populated by combinations like (S2,S2), (D1,S2), (S2,D1), (D1,D1), (S3,S1), (T1,S1). (Value: 6)

2.  **Checkout Calculation:** `score = 4, darts = 2`
    *   Iterate `finalDouble` throws:
        *   `finalDouble = D1` (points = 2):
            *   Case A: `2 === 4 && 2 >= 1` is false.
            *   Case B: `k` from 2 to 2 (so `k=2`)
                *   `requiredPreviousScore = 4 - 2 = 2`
                *   `dartsBeforeLast = 2 - 1 = 1`
                *   `totalCheckoutRoutes += dp[2][1]` (which is 2).
                *   `totalCheckoutRoutes` becomes 2. (Routes: `S2 D1`, `D1 D1`)
        *   `finalDouble = D2` (points = 4):
            *   Case A: `4 === 4 && 2 >= 1` is true. `totalCheckoutRoutes++`.
                *   `totalCheckoutRoutes` becomes 3. (Route: `D2`)
            *   Case B: `k` from 2 to 2 (so `k=2`)
                *   `requiredPreviousScore = 4 - 4 = 0`
                *   `dartsBeforeLast = 2 - 1 = 1`
                *   `totalCheckoutRoutes += dp[0][1]` (which is 0, since no throw gives 0 points).
                *   `totalCheckoutRoutes` remains 3.
        *   Other `finalDouble` throws (D3, D4, etc.) have points > 4, so they cannot sum to 4.

    The final `totalCheckoutRoutes` is 3, matching the example output.

This approach is efficient enough given the small constraints (`score` up to 170, `darts` up to 5).

```typescript
// Standard input/output for CodinGame
declare function readline(): string;
declare function print(message: any): void;

// Define DartThrow type
type DartThrow = {
    type: 'S' | 'D' | 'T';
    value: number; // The numerical value associated with the segment (e.g., 20 for T20)
    points: number; // The points scored by this throw (e.g., 60 for T20)
};

// Generate all possible distinct throws
const allPossibleThrows: DartThrow[] = [];

// Singles (S1-S20, S25 - Bullseye)
for (let i = 1; i <= 20; i++) {
    allPossibleThrows.push({ type: 'S', value: i, points: i });
}
allPossibleThrows.push({ type: 'S', value: 25, points: 25 }); // Bullseye (Outer Bull)

// Doubles (D1-D20, D25 - Double Bull)
for (let i = 1; i <= 20; i++) {
    allPossibleThrows.push({ type: 'D', value: i, points: i * 2 });
}
allPossibleThrows.push({ type: 'D', value: 25, points: 50 }); // Double Bull

// Trebles (T1-T20)
for (let i = 1; i <= 20; i++) {
    allPossibleThrows.push({ type: 'T', value: i, points: i * 3 });
}

// Separate double throws for the final dart check
const allDoubleThrows = allPossibleThrows.filter(t => t.type === 'D');

// Max constraints for DP table based on problem statement
const MAX_SCORE_CONSTRAINT = 170; // Score can be up to 170
const MAX_DARTS_CONSTRAINT = 5;   // Darts can be up to 5

// DP table: dp[score_achieved][darts_used] = number of ways to reach `score_achieved` using exactly `darts_used` darts.
// The darts can be any type (not restricted to non-doubles for intermediate steps).
const dp: number[][] = Array(MAX_SCORE_CONSTRAINT + 1).fill(0).map(() => Array(MAX_DARTS_CONSTRAINT + 1).fill(0));

// Base case: 0 score with 0 darts can be achieved in 1 way (do nothing)
dp[0][0] = 1;

// Populate the DP table
// Iterate through the number of darts already used (d_used)
// We iterate up to MAX_DARTS_CONSTRAINT - 1 because each iteration adds one more dart,
// resulting in paths of length d_used + 1. The maximum length we need is MAX_DARTS_CONSTRAINT.
for (let d_used = 0; d_used < MAX_DARTS_CONSTRAINT; d_used++) {
    // Iterate through current score achieved (s_current)
    for (let s_current = 0; s_current <= MAX_SCORE_CONSTRAINT; s_current++) {
        // If there's no way to reach this current state with d_used darts, skip
        if (dp[s_current][d_used] === 0) {
            continue;
        }

        // Try adding each possible dart throw
        for (const dartThrow of allPossibleThrows) {
            const points = dartThrow.points;
            const nextScore = s_current + points;
            const nextDartsUsed = d_used + 1;

            // Check if the next state is within valid bounds (score not exceeding MAX_SCORE_CONSTRAINT, darts not exceeding MAX_DARTS_CONSTRAINT)
            if (nextScore <= MAX_SCORE_CONSTRAINT && nextDartsUsed <= MAX_DARTS_CONSTRAINT) {
                // Add the number of ways to reach the current state to the next state.
                // This correctly counts ordered paths because we build them sequentially, dart by dart.
                dp[nextScore][nextDartsUsed] += dp[s_current][d_used];
            }
        }
    }
}

// Read input from CodinGame
const score: number = parseInt(readline());
const darts: number = parseInt(readline());

let totalCheckoutRoutes = 0;

// Calculate the number of checkout routes based on the rules:
// 1. Total sum of darts must equal `score`.
// 2. Use LESS THAN OR EQUAL TO `darts` number of darts.
// 3. The final dart MUST land in a double segment.

// Iterate over all possible final double throws
for (const finalDouble of allDoubleThrows) {
    const doublePoints = finalDouble.points;

    // Case 1: Checkout with a single dart (must be a double)
    // If the double itself equals the target score and we have at least 1 dart available
    if (doublePoints === score && darts >= 1) {
        totalCheckoutRoutes++;
    }

    // Case 2: Checkout with more than one dart (2 to `darts` darts total)
    // The previous darts (k-1 darts) can be any type, and their sum must be `score - doublePoints`.
    for (let k = 2; k <= darts; k++) { // k represents the total number of darts used for the checkout
        const requiredPreviousScore = score - doublePoints;
        const dartsBeforeLast = k - 1; // Number of darts used before the final double

        // Ensure the required previous score is non-negative and within DP table bounds.
        // We also need to ensure dartsBeforeLast is a valid index for dp (which it will be >=1 due to k>=2)
        if (requiredPreviousScore >= 0 && requiredPreviousScore <= MAX_SCORE_CONSTRAINT) {
            // Add the number of ways to reach the `requiredPreviousScore` using `dartsBeforeLast` darts.
            // These ways are already ordered and include all allowed dart types (S, D, T) for intermediate throws.
            totalCheckoutRoutes += dp[requiredPreviousScore][dartsBeforeLast];
        }
    }
}

// Output the result
print(totalCheckoutRoutes);

```