The puzzle requires us to solve for 16 different probabilities related to two events A and B, given three initial probabilities. The probabilities are expressed as fractions. We need to handle various relationships between probabilities (complement, conjunction, conditional) and detect contradictions.

**1. Probability Types and Naming:**

There are 16 distinct probabilities that can be formed using events A, B, NOT (negation), AND (conjunction), and GIVEN (conditional). For consistency and clarity, we'll use the exact string names provided in the problem description for keys in our probability map and for output.

The 16 probabilities, listed in their required lexicographical order:
1. `A`
2. `A AND B`
3. `A AND NOT B`
4. `A GIVEN B`
5. `A GIVEN NOT B`
6. `B`
7. `B GIVEN A`
8. `B GIVEN NOT A`
9. `NOT A`
10. `NOT A AND B`
11. `NOT A AND NOT B`
12. `NOT A GIVEN B`
13. `NOT A GIVEN NOT B`
14. `NOT B`
15. `NOT B GIVEN A`
16. `NOT B GIVEN NOT A`

**2. Fraction Class:**

Since probabilities are given as fractions and require arithmetic operations and simplification, a `Fraction` class is essential.
- It stores `num` (numerator) and `den` (denominator).
- The constructor simplifies the fraction using the greatest common divisor (GCD) and ensures the denominator is positive.
- Methods for `add`, `subtract`, `multiply`, and `divide` are implemented, returning new `Fraction` objects.
- `equals` checks for equality between two simplified fractions.
- `isZero` and `isOne` are utility methods.
- `isValidProb` checks if the fraction represents a valid probability (between 0 and 1, inclusive).
- `toString` formats the fraction as `num/den`.

**3. Probability Relationships (Rules):**

The core of the solver is a set of rules that allow us to derive unknown probabilities from known ones. We can categorize these rules:

*   **Complement Rules:**
    *   `P(NOT X) = 1 - P(X)`
    *   `P(X) = 1 - P(NOT X)`
    *   Applies to `A`/`NOT A`, `B`/`NOT B`, and all conditional pairs (e.g., `A GIVEN B`/`NOT A GIVEN B`).

*   **Conjunction (AND) Rules:**
    *   `P(X AND Y) = P(X GIVEN Y) * P(Y)`
    *   `P(X AND Y) = P(Y GIVEN X) * P(X)`
    *   Also, the sum of disjoint conjunctions equals a marginal probability (e.g., `P(A) = P(A AND B) + P(A AND NOT B)`). This implies subtraction rules like `P(A AND B) = P(A) - P(A AND NOT B)`.
    *   The total probability `P(A AND B) + P(A AND NOT B) + P(NOT A AND B) + P(NOT A AND NOT B) = 1` can be used to find a missing conjunction if the other three are known.

*   **Conditional Probability Rules:**
    *   `P(X GIVEN Y) = P(X AND Y) / P(Y)` (provided `P(Y) > 0`).

**4. Solver Strategy (Fixed-Point Iteration):**

The solver uses an iterative approach:
1.  **Initialization:** A `Map<string, Fraction>` (`probValues`) stores all currently known probabilities. It's initialized with the three given input probabilities.
2.  **`setProb(key, value)` function:** This helper function is crucial:
    *   It first validates `value` using `isValidProb()` (checking if `0 <= value <= 1`). If invalid, it throws an "IMPOSSIBLE" error.
    *   If `key` is already in `probValues`, it checks if `value` is consistent with the existing value. If not, it throws "IMPOSSIBLE".
    *   If `key` is new or `value` is consistent, it adds/updates the `probValues` map and returns `true` if a *new* value was set, `false` otherwise.
3.  **`calculateTargetProb(targetKey)` function:** This function attempts to calculate a single `targetKey` probability using all possible rules and currently known probabilities. It returns a `Fraction` if successful, or `null` if it cannot be derived in the current state.
    *   It systematically checks all possible formulas for the `targetKey`.
    *   It carefully handles division by zero: if a denominator for a conditional probability is zero, that specific derivation path is skipped (as the conditional probability would be undefined by division).
4.  **Main Loop (`while (changedInLastIteration)`):**
    *   The solver repeatedly calls a function `calculateOneIterationOptimized()` until no new probabilities can be derived in a full pass.
    *   `calculateOneIterationOptimized()` iterates through all 16 `ALL_PROBABILITIES_KEYS`. For each unknown probability, it calls `calculateTargetProb()`. If `calculateTargetProb()` returns a value, `setProb()` is called to store it. If `setProb()` indicates a new value was added, `changedInLastIteration` is set to `true`, ensuring another iteration.
5.  **Error Handling:** A global `isImpossible` flag and `try-catch` block are used. Any `IMPOSSIBLE` error (e.g., probability out of range, contradiction) terminates execution and prints "IMPOSSIBLE".
6.  **Output:** After the loop converges or an impossibility is detected, the `probValues` map is iterated in the specified lexicographical order, and known probabilities are printed.

**Example Walkthrough (A = 1/2, B = 1/3, A AND B = 1/6):**

1.  **Initial:**
    *   `A`: 1/2
    *   `B`: 1/3
    *   `A AND B`: 1/6
2.  **Iteration 1:**
    *   `NOT A` is derived from `A`: `1 - 1/2 = 1/2`.
    *   `NOT B` is derived from `B`: `1 - 1/3 = 2/3`.
    *   `A GIVEN B` is derived from `A AND B` and `B`: `(1/6) / (1/3) = 1/2`.
    *   `B GIVEN A` is derived from `A AND B` and `A`: `(1/6) / (1/2) = 1/3`.
    *   `A AND NOT B` is derived from `A` and `A AND B`: `1/2 - 1/6 = 1/3`.
    *   `NOT A AND B` is derived from `B` and `A AND B`: `1/3 - 1/6 = 1/6`.
    *   ... many more derived ...
3.  **Subsequent Iterations:** The process continues, deriving more probabilities from the newly known ones until no new values can be found.

This systematic approach ensures all derivable probabilities are found and contradictions are correctly identified.