The puzzle requires us to analyze a given text `S`, count the occurrences of each letter (A-Z, case-insensitive), calculate their percentages, and then display these percentages as a horizontal histogram.

Here's a step-by-step breakdown of the solution logic:

1.  **Count Letter Occurrences**:
    *   We initialize an array `counts` of size 26 (for A-Z) with all values set to 0.
    *   We also need a `totalLetters` variable to keep track of the total count of valid letters encountered.
    *   We iterate through each character of the input string `S`.
    *   For each character, we check if it's an uppercase letter (A-Z) or a lowercase letter (a-z).
    *   If it's an uppercase letter, we increment the count for its corresponding index (`charCodeAt(0) - 'A'.charCodeAt(0)`).
    *   If it's a lowercase letter, we convert it to its uppercase equivalent by subtracting `'a'.charCodeAt(0)` (which gives the same index as the uppercase version) and increment its count.
    *   In both cases, we increment `totalLetters`. The problem constraint "S contains at least one letter" guarantees that `totalLetters` will be at least 1.

2.  **Calculate Percentages**:
    *   After counting, we iterate from A to Z (using the 26 indices of our `counts` array).
    *   For each letter, its `percentageValue` is calculated as `(count_of_letter / totalLetters) * 100`.
    *   The `formattedPercentage` string is generated using `toFixed(2)` to round the percentage to two decimal places, followed by a '%' sign.
    *   The `barLength` (number of blank spaces for the histogram bar) is calculated by rounding the `percentageValue` to the nearest integer using `Math.round()`. This precisely matches the problem's examples (e.g., 4.85 rounds to 5, 0.4 rounds to 0).
    *   We store these calculated values (letter, percentageValue, formattedPercentage, barLength) for each letter.

3.  **Print Histogram**:
    *   We iterate through the calculated histogram data for each letter.
    *   **Conditional Formatting**: The output format differs based on whether the `barLength` is 0 or greater than 0:
        *   **If `barLength` is 0** (meaning the rounded percentage is 0, e.g., 0.00% or 0.49%):
            *   Print the letter, a vertical bar, and the formatted percentage (e.g., `B |0.00%`).
            *   Print a bottom border line consisting of `  +` (e.g., `  +`). No hyphens are needed for the bar.
        *   **If `barLength` is greater than 0**:
            *   Print the top border: `  +` followed by `barLength` hyphens (`-`) and a `+` (e.g., `  +---------+`).
            *   Print the bar line: the letter, ` |`, `barLength` spaces (` `), `|`, and the formatted percentage (e.g., `D |         |9.09%`).
            *   Print the bottom border: `  +` followed by `barLength` hyphens (`-`) and a `+` (e.g., `  +---------+`).

This approach handles character counting, percentage calculation, rounding, and output formatting precisely as specified in the puzzle description and examples.