The puzzle requires us to restore missing digits (represented by `?`) in a mathematical expression such that the equation holds true. The expression consists of positive integers, a single type of operator (`+`, `-`, `*`, `/`), and an equals sign `=`. The right-hand side (RHS) of the equation never contains `?`.

Here's a breakdown of the solution strategy:

1.  **Parsing the Input**:
    *   The input string is split by spaces into an array of tokens.
    *   The `equals sign` (`=`) is used to separate the left-hand side (LHS) from the right-hand side (RHS).
    *   The last token is the RHS value, which is converted to a `BigInt` to handle potentially large numbers.
    *   The token immediately preceding `=` is the operator.
    *   All tokens before the operator are the LHS numbers (which might contain `?`s).

2.  **Identifying Question Marks**:
    *   We iterate through each LHS number string and identify the position of every `?` character.
    *   These positions (along with their respective number index and digit index) are stored in a list. This allows us to systematically fill them in.

3.  **Recursive Brute-Force (`Backtracking`)**:
    *   The core of the solution is a recursive function, `findSolution`, which attempts to fill each `?` with digits from `0` to `9`.
    *   **Base Case**: When all `?`s have been filled (i.e., the recursion reaches the end of the `questionMarkPositions` list):
        *   Each number string on the LHS is converted to a `BigInt`.
        *   **Positive Integer Constraint**: A crucial rule from the problem is that the numbers in the expression must be "positive integers". This means any number that evaluates to `0n` (e.g., `?` becoming `0`, or `??` becoming `00`) is invalid. If any LHS number, after `?` substitution, turns out to be `0n`, this combination is immediately discarded.
        *   The arithmetic operation (addition, subtraction, multiplication, or division) is performed on the `BigInt` numbers. `BigInt` is essential because intermediate or final results can exceed standard JavaScript `number` (53-bit integer precision) limits. `BigInt` handles integer division automatically.
        *   If the calculated LHS result matches the `rhsValue`, a valid solution has been found. We store this solution and set a flag (`solutionFound`) to `true` to stop further unnecessary computations in other branches.
    *   **Recursive Step**: For the current `?` being processed:
        *   We determine the valid range of digits to try (typically `0-9`).
        *   **Leading Zero Rule for Positive Integers**: If a number string consists of only a single `?` (e.g., `?`), it cannot be `0` because `0` is not a positive integer. In this specific case, the `?` must be replaced by a digit from `1` to `9`. For multi-digit numbers where `?` is the leading digit (e.g., `?5` or `??`), `0` is generally allowed because `BigInt("05")` correctly parses to `5n`, which is positive. The general check for `0n` in the base case handles cases like `BigInt("00")` (which becomes `0n`).
        *   For each valid digit, we create a new temporary LHS number string with the `?` replaced.
        *   A recursive call is made for the next `?` in the list with the updated LHS number strings. If that call finds a solution, it propagates `true` back up the call stack, effectively stopping the search.

4.  **Output Construction**:
    *   Once `solutionFound` is true, the stored `resultLhsNumberStrings` are used to reconstruct the final expression, replacing the original `?`s with the found digits.
    *   The complete expression is then printed to the console.

**Constraints and Considerations**:

*   **Expression Length**: Less than 256 characters. This implies that the maximum number of `?`s is limited. While `10^K` complexity for `K` question marks can be large, typical CodinGame puzzles with this structure usually have `K` small enough (e.g., up to 6-8) to pass within time limits.
*   **BigInt**: Crucial for handling potentially large integer values and results that exceed `2^53 - 1`.
*   **Operator Type**: All operators are of the same type, simplifying evaluation as no operator precedence rules are needed.

The approach is robust and handles the specified constraints, including the "positive integers" rule and potential large numbers.