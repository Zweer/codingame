The puzzle asks us to validate condensed formulas of alicyclic hydrocarbons. The core rule is based on the valency of carbon: each carbon atom forms exactly 4 bonds. In a `CHn` unit, `n` bonds are formed with hydrogen atoms, leaving `4 - n` bonds available for connection to other carbon atoms (via `(m)` bond units).

**Problem Breakdown:**

1.  **Input Parsing:** We need to read the condensed formula string and break it down into individual `CHn` carbon units and `(m)` bond units.
2.  **Valence Calculation:** For each `CHn` unit, we determine the required number of carbon-carbon bonds (`4 - n`).
3.  **Adjacent Bond Summation:** For each `CHn` unit, we sum the strengths (`m` values) of the adjacent `(m)` bond units.
4.  **Validation:** We compare the calculated required bonds with the summed actual bonds. If they don't match for any `CHn` unit, the compound is `INVALID`. Otherwise, if all `CHn` units satisfy their valency, the compound is `VALID`.

**Detailed Steps:**

1.  **Read Input:**
    *   Read `N`, the number of compounds.
    *   Loop `N` times, reading one `COMPOUND` string per iteration.

2.  **Parse Compound String:**
    *   We can use a regular expression to extract all `CHn` and `(m)` units from the compound string. The regex `(CH[0-4])|(\([1-4]\))` with the global flag (`g`) is suitable.
        *   `CH[0-4]` matches "CH" followed by a digit from 0 to 4 (for `n`). This will be captured in the first group (`match[1]`).
        *   `\([1-4]\)` matches an opening parenthesis, a digit from 1 to 4 (for `m`), and a closing parenthesis. This will be captured in the second group (`match[2]`).
    *   Iterate through the matches and store them in an array, differentiating between 'CH' units (storing `n`) and 'bond' units (storing `m`).

3.  **Validate Each Carbon Unit:**
    *   Loop through the parsed array of parts.
    *   If a part is a `CH` unit:
        *   Calculate `required_bonds = 4 - part.n`.
        *   Initialize `actual_bonds = 0`.
        *   Check the element immediately to its left: If it's a 'bond' unit, add its `m` value to `actual_bonds`.
        *   Check the element immediately to its right: If it's a 'bond' unit, add its `m` value to `actual_bonds`.
        *   Compare `actual_bonds` with `required_bonds`. If they are not equal, set a flag `isValid` to `false` and break the loop for the current compound.

4.  **Output Result:**
    *   After checking all carbon units in a compound, print `VALID` if `isValid` is still `true`, otherwise print `INVALID`.

**Assumptions from Problem Statement:**

*   "The inputs given will have a valid representation": This implies that the format of `CHn` and `(m)` units is always correct (e.g., `n` is between 0-4, `m` is between 1-4, and the sequence correctly alternates between `CHn` and `(m)` units). We don't need to validate the syntax or presence of non-valid characters. We only need to check the bond counts.

---