The problem requires us to evaluate arithmetic expressions that can include dice rolls and output the probability distribution of the possible outcomes. This involves handling operator precedence, parentheses, integer literals, and dice roll notations (`dn`).

The core idea is to represent the result of evaluating any part of the expression not as a single number, but as a "probability distribution" – a mapping from each possible outcome to its probability.

**1. Data Structure for Probability Distribution:**
A `Map<number, number>` is suitable, where the `key` is the outcome (an integer) and the `value` is its probability (a float between 0 and 1).

**2. Parsing Strategy (Recursive Descent Parser):**
We'll implement a recursive descent parser, which naturally handles operator precedence and parentheses. The parser follows these steps:
*   **Tokenization:** First, the input string is converted into a stream of tokens (numbers, dice, operators, parentheses).
*   **Parsing Functions (by Precedence):**
    *   `parseExpression()`: Handles `>` (lowest precedence).
    *   `parseTerm()`: Handles `+` and `-`.
    *   `parseFactor()`: Handles `*`.
    *   `parsePrimary()`: Handles basic operands: integer literals, dice rolls (`dn`), and parenthesized sub-expressions.

**3. Operations on Distributions:**
When an operator combines two distributions (`dist1` and `dist2`), the new distribution is computed by considering every possible pair of outcomes from `dist1` and `dist2`.
*   For each `(val1, prob1)` in `dist1` and `(val2, prob2)` in `dist2`:
    *   The `newOutcome` is `val1` `op` `val2`.
    *   The `newProbability` is `prob1 * prob2` (since dice rolls are independent events).
    *   These `newOutcome` and `newProbability` pairs are added to a temporary result map. If an `newOutcome` already exists, its probability is summed up.

**Specific Operator Implementations:**
*   **Number `n`**: Results in a distribution `Map { n => 1.0 }`.
*   **Dice `dn`**: Results in a distribution `Map { 1 => 1/n, 2 => 1/n, ..., n => 1/n }`.
*   **`*`, `+`, `-`**: Use the `combineDistributions` helper function with the respective arithmetic operator (`(a, b) => a * b`, `(a, b) => a + b`, `(a, b) => a - b`).
*   **`>` (Greater-than comparison)**: This is a special case. The `newOutcome` is `1` if `val1 > val2`, otherwise `0`. The `newProbability` is still `prob1 * prob2`. The resulting distribution will only contain outcomes `0` and `1`.

**4. Output Formatting:**
After the entire expression is parsed and evaluated, the final `Distribution` map needs to be processed:
*   Convert the `Map` entries into an array.
*   Sort the array by outcome in ascending order.
*   For each outcome, format its probability: multiply by 100 (for percentage), round to two decimal places, and then format to a string with exactly two decimal places.

**Example `1+d4+1` walkthrough:**
1.  `1`: Becomes `{1: 1.0}`
2.  `d4`: Becomes `{1: 0.25, 2: 0.25, 3: 0.25, 4: 0.25}`
3.  `1 + d4`: Combines `{1: 1.0}` and `{1: 0.25, ..., 4: 0.25}`
    *   `1+1=2` (prob `1.0 * 0.25 = 0.25`)
    *   `1+2=3` (prob `1.0 * 0.25 = 0.25`)
    *   `1+3=4` (prob `1.0 * 0.25 = 0.25`)
    *   `1+4=5` (prob `1.0 * 0.25 = 0.25`)
    *   Result: `{2: 0.25, 3: 0.25, 4: 0.25, 5: 0.25}`
4.  `(1+d4) + 1`: Combines the previous result with `{1: 1.0}`
    *   `2+1=3` (prob `0.25 * 1.0 = 0.25`)
    *   `3+1=4` (prob `0.25 * 1.0 = 0.25`)
    *   `4+1=5` (prob `0.25 * 1.0 = 0.25`)
    *   `5+1=6` (prob `0.25 * 1.0 = 0.25`)
    *   Final result: `{3: 0.25, 4: 0.25, 5: 0.25, 6: 0.25}`
5.  Output:
    `3 25.00`
    `4 25.00`
    `5 25.00`
    `6 25.00`

This approach correctly handles the probabilistic nature and operator precedence.