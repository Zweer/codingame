The puzzle asks us to solve a cryptarithm, which is an arithmetic equation where digits are replaced by letters. Specifically, it's an addition problem where a set of words sum up to a total word (e.g., COCA + COLA = OASIS).

Here are the key rules and constraints:
1.  **Addition**: The operation is always addition.
2.  **Single Solution**: There is always exactly one unique solution.
3.  **Unique Digit Assignment**: Each distinct letter must map to a unique digit from 0 to 9.
4.  **No Leading Zeros**: The first letter of any word (addend or total) cannot be assigned the digit 0.
5.  **Input Constraints**: `N` (number of addend words) is between 2 and 5.

**Approach:**

This problem is a classic candidate for a backtracking algorithm, combined with an efficient way to check the validity of a letter-to-digit assignment.

1.  **Parse Input and Identify Letters**:
    *   Read `N`, the `N` addend words, and the `total` word.
    *   Collect all unique letters appearing in all words. Store them in a sorted array (e.g., alphabetically) for consistent iteration during backtracking and for the required output format.
    *   Identify all letters that appear at the beginning of any word. These letters cannot be assigned the digit 0.

2.  **Transform to a Linear Equation**:
    Instead of converting words to numbers and performing addition in each check, which can be computationally heavy, we can transform the cryptarithm into a linear equation.
    For example, `COCA + COLA = OASIS` can be rewritten as:
    `1000*C + 100*O + 10*C + 1*A`
    `+ 1000*C + 100*O + 10*L + 1*A`
    `- 10000*O - 1000*A - 100*S - 10*I - 1*S = 0`

    Combine coefficients for each unique letter:
    `C: (1000 + 10 + 1000) = 2010`
    `O: (100 + 100 - 10000) = -9800`
    `A: (1 + 1 - 1000) = -998`
    `L: (10)`
    `S: (-100 - 1) = -101`
    `I: (-10)`

    The equation becomes: `2010*C - 9800*O - 998*A + 10*L - 101*S - 10*I = 0`.
    Our goal is to find digit assignments for C, O, A, L, S, I that make this sum zero.
    We'll pre-calculate these coefficients for all unique letters. For each letter `L` and its position `p` (from right, 0-indexed) in a word:
    *   If `L` is in an addend word, add `10^p` to `L`'s coefficient.
    *   If `L` is in the total word, subtract `10^p` from `L`'s coefficient.

3.  **Backtracking Algorithm**:
    *   We'll use a recursive function, `backtrack(k)`, where `k` is the index of the letter we're currently trying to assign a digit to (from our `sortedLetters` array).
    *   **Base Case**: If `k` equals the total number of unique letters, it means all letters have been assigned a digit. At this point, calculate the sum of `coefficient * assigned_digit` for all letters. If the sum is 0, we've found the solution. Since there's only one solution, we can stop the search.
    *   **Recursive Step**: For the `currentLetter` (`sortedLetters[k]`):
        *   Iterate through digits from 0 to 9.
        *   **Pruning (Constraint Checks)**:
            *   If the digit is already `used` by another letter, skip it.
            *   If `currentLetter` is a leading letter (cannot be 0) and the `digit` is 0, skip it.
        *   **Assign**: If the digit is valid, assign it to `currentLetter` and mark the digit as `used`.
        *   **Recurse**: Call `backtrack(k + 1)`. If this call returns `true` (meaning a solution was found down that path), propagate `true` upwards.
        *   **Backtrack**: If `backtrack(k + 1)` returns `false`, it means that assignment didn't lead to a solution. Unassign the digit from `currentLetter` and unmark the digit as `used` to explore other possibilities.

4.  **Output**: Once the `backtrack` function finds the solution, print each letter and its assigned digit, sorted alphabetically by letter.

**Why this approach is efficient enough:**
*   The number of unique letters is at most 10 (since there are only 10 digits).
*   The number of permutations of 10 digits is `10! = 3,628,800`, which is small enough for modern computers to check quickly.
*   The check (`sum = 0`) is a simple linear calculation, not a complex string-to-number conversion and addition.
*   Pruning (checking `usedDigits` and `firstLettersCannotBeZero`) significantly reduces the search space.