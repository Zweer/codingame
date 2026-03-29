while (current_n < a) {
            // If current_n * 2 would exceed b, no valid n for this p. Set current_n to > b and break.
            if (current_n > b / 2) { 
                current_n = b + 1; 
                break;
            }
            current_n *= 2;
        }
        ```
    *   **Second loop (count):**
        ```typescript
        while (current_n <= b) {
            // At this point, current_n is guaranteed to be >= a (from first loop) and <= b (from this loop condition).
            count++; 

            // If current_n * 2 would exceed b, no more valid n for this p. Break.
            if (current_n > b / 2) {
                break;
            }
            current_n *= 2;
        }
        ```
7.  Print `count`.

### Example Trace (a=3, b=6)

1.  `fermatPrimes = [3, 5, 17, 257, 65537]`
2.  `productsOfFermatPrimes` populated: `{1, 3, 5, 15, 17, ...}` (all 32 products)
3.  `count = 0`

*   **For `p = 1`**:
    *   `current_n = 1`.
    *   **Fast-forward**:
        *   `1 < 3`: true. `1 <= 6/2` (3): true. `current_n = 2`.
        *   `2 < 3`: true. `2 <= 6/2` (3): true. `current_n = 4`.
        *   `4 < 3`: false. Loop ends. `current_n = 4`.
    *   **Count**:
        *   `4 <= 6`: true. `count = 1`.
        *   `4 > 6/2` (3): true. Break.
*   **For `p = 3`**:
    *   `current_n = 3`.
    *   **Fast-forward**: `3 < 3`: false. Loop ends. `current_n = 3`.
    *   **Count**:
        *   `3 <= 6`: true. `count = 2`.
        *   `3 > 6/2` (3): false. `current_n = 6`.
        *   `6 <= 6`: true. `count = 3`.
        *   `6 > 6/2` (3): true. Break.
*   **For `p = 5`**:
    *   `current_n = 5`.
    *   **Fast-forward**: `5 < 3`: false. Loop ends. `current_n = 5`.
    *   **Count**:
        *   `5 <= 6`: true. `count = 4`.
        *   `5 > 6/2` (3): true. Break.
*   **For `p = 15` (and all larger `p`s)**:
    *   `current_n = 15`.
    *   **Fast-forward**: `15 < 3`: false. Loop ends. `current_n = 15`.
    *   **Count**: `15 <= 6`: false. Loop doesn't run.

Final `count = 4`. This matches the example.