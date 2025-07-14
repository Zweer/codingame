The problem requires us to process a list of chemical formulas. For each formula, we must first convert it into its standard "Hill Notation" representation. Then, all unique Hill Notation formulas must be sorted according to "Hill Order". Finally, the sorted unique formulas are printed.

Let's break down the solution into its main components:

1.  **Parsing Chemical Formulas (`parseFormula`)**:
    Chemical formulas can contain elements (e.g., `H`, `O`, `Al`, `Cl`), numbers representing counts (e.g., `H2`), and parentheses for grouping (e.g., `Al2(SO4)3`). To correctly count each element, we need a parser that handles these rules, especially nested parentheses with multipliers.
    A stack-based approach is suitable for this:
    *   When an opening parenthesis `(` is encountered, we push the current element counts map onto a stack and start a new, empty map for the elements inside the parenthesis.
    *   When a closing parenthesis `)` is encountered, we look for an optional multiplier number immediately following it. We then multiply the counts of the elements in the current map (which represents the group inside the parentheses) by this multiplier. After multiplication, we pop the previous element counts map from the stack and merge the multiplied counts into it.
    *   For elements and their counts (e.g., `H2`, `Al`), we identify the element symbol (uppercase letter followed by optional lowercase letters) and its count (defaulting to 1 if no number is present). These counts are added to the `currentCounts` map.
    *   The `currentCounts` map always holds the counts for the current scope (either the top level or inside the innermost parenthesis group).

2.  **Converting to Hill Notation (`toHillNotation`)**:
    Once we have the total counts for each element in a `Map<string, number>`, we need to format them into a string according to Hill Notation rules:
    *   **Rule 1 (Carbon Present)**: If the compound contains Carbon (`C`), then `C` is listed first. If Hydrogen (`H`) is also present, it's listed second. All other elements are then sorted alphabetically and appended.
    *   **Rule 2 (No Carbon)**: If Carbon is not present, all elements (including Hydrogen) are sorted alphabetically.
    *   Counts: If an element's count is 1, no number is appended (e.g., `H` instead of `H1`). If the count is greater than 1, the number is appended (e.g., `H2`).

3.  **Parsing Hill Notation String (`parseHillNotationString`)**:
    To sort compounds in Hill Order, we need to compare them element by element and then by count. It's helpful to parse the Hill Notation string back into a sequence of `[element, count]` pairs. This function is simpler than `parseFormula` as it doesn't deal with parentheses or complex nesting.

4.  **Sorting by Hill Order (`compareHillNotation`)**:
    This is a custom comparison function used with `Array.prototype.sort()`. It takes two Hill Notation strings as input and returns a number indicating their relative order:
    *   First, it parses both input strings into `[element, count][]` arrays using `parseHillNotationString`.
    *   It then iterates through these arrays, comparing corresponding elements.
    *   **Rule 1 (Alphabetical by Element)**: If elements at the current position differ (e.g., comparing `Al` vs `C`), the compound with the element that comes first alphabetically is sorted first.
    *   **Rule 2 (Count if Elements Same)**: If elements at the current position are the same (e.g., comparing `C` vs `C`), then the compound with the *fewer* of that element is sorted first.
    *   **Length Comparison**: If one formula runs out of elements before the other (e.g., `CH4` vs `CH4O`), the shorter one comes first.
    *   If all elements and counts are identical, the formulas are considered equal.

5.  **Main Logic**:
    *   Read the number of compounds `N`.
    *   Initialize a `Set<string>` to store unique Hill Notation formulas. Using a `Set` automatically handles duplicates.
    *   Loop `N` times:
        *   Read each chemical formula.
        *   Parse it using `parseFormula` to get element counts.
        *   Convert the counts to Hill Notation string using `toHillNotation`.
        *   Add the resulting Hill Notation string to the `Set`.
    *   Convert the `Set` to an `Array` using `Array.from()`.
    *   Sort the array using the `compareHillNotation` function.
    *   Print each sorted formula.