The puzzle asks us to find a 4-digit secret number based on a series of guesses and their corresponding "bulls" and "cows" counts. A key difference from the classic Bulls and Cows game is that digits in the secret number can be repeated.

**Understanding Bulls and Cows:**

*   **Bulls:** A digit in your guess that matches both the value and the position of a digit in the secret number.
*   **Cows:** A digit in your guess that matches the value of a digit in the secret number, but is in the wrong position.
*   **Important Handling for Repeated Digits:** When counting bulls and cows, each digit in the secret number and the guess can only contribute once. For example, if the secret is "1233" and the guess is "3123":
    *   The '3' at the end is a bull (matches position and value).
    *   The '3' from `guess[0]` is a cow (matches one of the '3's in secret, but wrong position).
    *   The '1' from `guess[1]` is a cow.
    *   The '2' from `guess[2]` is a cow.
    Total: 1 Bull, 3 Cows.

    To correctly handle this, the standard approach is:
    1.  **First Pass (Bulls):** Iterate through both the guess and the secret simultaneously. If `guess[i] == secret[i]`, increment bulls and mark both `guess[i]` and `secret[i]` as "used".
    2.  **Second Pass (Cows):** Iterate through the guess. If `guess[i]` was *not* used for a bull, check if it exists anywhere in the secret number where the `secret[j]` was *not* used for a bull. If a match is found, increment cows, mark `secret[j]` as "used" (for a cow), and move to the next `guess[i]`. This ensures each digit is only counted once.

**Problem-Solving Strategy:**

Since the secret number is a 4-digit number, and digits can be from 0-9 and can be repeated, there are 10 * 10 * 10 * 10 = 10,000 possible secret numbers (from "0000" to "9999").

The most straightforward approach for this problem is brute-force:

1.  **Generate all possible secret numbers:** Loop from 0 to 9999. For each number, convert it to a 4-digit string (e.g., `5` becomes `0005`, `123` becomes `0123`).
2.  **Test each possible secret number:** For every potential secret number, check if it's consistent with *all* the given guesses.
    *   For each given guess (and its reported bulls/cows), calculate the bulls and cows that *would* be obtained if the current `possibleSecret` were the true secret number.
    *   Compare these calculated bulls/cows with the reported bulls/cows from the input.
    *   If, for *any* guess, the calculated counts do not match the reported counts, then the `possibleSecret` is incorrect. Move to the next `possibleSecret`.
3.  **Identify the solution:** If a `possibleSecret` is found to be consistent with *all* given guesses, then it is the correct secret number. Print it and terminate, as the problem implies a unique solution.

**Time Complexity:**

*   There are 10,000 possible secret numbers.
*   For each possible secret number, we iterate through `N` guesses (where `N` is up to 20).
*   The `calculateBullsAndCows` function involves two nested loops of fixed size 4 (4 characters in a 4-digit number), so it's a constant time operation (very fast).
*   Total operations: `10,000 * N * C` (where C is a small constant).
*   Maximum operations: `10,000 * 20 * (approx. 4*4*2 = 32 operations per calculation) = 6,400,000` operations. This is well within typical time limits for competitive programming (usually around 10^8 operations per second).

**TypeScript Implementation Details:**

*   Use `String(i).padStart(4, '0')` to format numbers like `5` into `0005`.
*   A helper function `calculateBullsAndCows(secret: string, guess: string)` will encapsulate the core logic for counting bulls and cows.
*   Boolean arrays (`secretUsed`, `guessUsed`) are crucial within `calculateBullsAndCows` to prevent double-counting digits.