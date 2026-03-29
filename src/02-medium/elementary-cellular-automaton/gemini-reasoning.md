The problem asks us to simulate an Elementary Cellular Automaton for a given number of generations. This automaton is one-dimensional and binary, meaning each cell is either `0` or `1`. Its evolution is based on a "Wolfram code" rule and the values of a cell's immediate neighbors (left, current, right). The system is periodic, or "wrapped around," meaning the leftmost cell's left neighbor is the rightmost cell, and vice-versa.

Here's a breakdown of the solution strategy:

1.  **Input Reading**:
    *   Read the Wolfram code `R` (an integer from 0 to 255).
    *   Read the number of generations `N` to simulate.
    *   Read the initial `pattern` string, where `@` represents `1` and `.` represents `0`.

2.  **Pattern Representation**:
    *   It's convenient to convert the input `pattern` string into an array of numbers (0s and 1s) for easier computation. For example, `.....@.....` becomes `[0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]`.

3.  **Rule Interpretation**:
    *   The Wolfram code `R` is an 8-bit number. Each bit corresponds to the next state for one of the 8 possible 3-cell neighborhoods (`111` down to `000`).
    *   The problem statement specifies the mapping:
        *   `111` (binary 7) corresponds to the 7th bit of `R`.
        *   `110` (binary 6) corresponds to the 6th bit of `R`.
        *   ...
        *   `000` (binary 0) corresponds to the 0th bit of `R`.
    *   This means if we take a neighborhood `LCR` (Left, Current, Right values) and form a 3-bit binary number `L * 4 + C * 2 + R * 1`, this value (0-7) directly tells us which bit of `R` to check. For instance, if the neighborhood is `010`, its value is `0*4 + 1*2 + 0*1 = 2`. We then check the 2nd bit of `R` (`(R >> 2) & 1`) to find the next state.

4.  **Simulation Loop**:
    *   We need to simulate `N` generations. The first output line is the initial pattern itself.
    *   In each generation (from 0 to `N-1`):
        *   **Print Current State**: Convert the current array of 0s and 1s back into the `@` and `.` string format and print it.
        *   **Calculate Next State**: Create a *new* array to store the next generation's state. It's crucial to calculate all cells' next states based *only* on the current generation's values.
            *   Iterate through each cell `i` in the `currentPattern` array.
            *   Determine the left and right neighbor indices using the modulo operator for wrapping:
                *   Left neighbor index: `(i - 1 + patternLength) % patternLength`
                *   Right neighbor index: `(i + 1) % patternLength`
            *   Get the `leftValue`, `currentValue`, and `rightValue`.
            *   Combine these into a `neighborhoodValue`: `leftValue * 4 + currentValue * 2 + rightValue * 1`.
            *   Use the `neighborhoodValue` to look up the next state in `R`: `(R >> neighborhoodValue) & 1`.
            *   Store this `nextState` in the `nextPattern` array at index `i`.
        *   **Update Current State**: After calculating all cells for the `nextPattern` array, replace `currentPattern` with `nextPattern` to prepare for the next iteration.

This approach ensures correct simulation of the cellular automaton, handling the wrapping behavior and the Wolfram code rule accurately.