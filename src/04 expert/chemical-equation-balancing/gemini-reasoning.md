The problem requires balancing a chemical equation given in a simplified molecular formula format. This is a classic problem that can be solved by setting up and solving a system of linear equations.

**Understanding the Input and Output:**

*   **Molecules:** An element symbol (e.g., `H`, `He`) followed by an optional number (e.g., `H2O`, `C6H12O6`). If no number, count is 1.
*   **Sides:** Molecules are separated by ` + `.
*   **Equation:** Left side ` -> ` Right side.
*   **Output:** Balanced equation with coefficients (omitted if 1), smallest whole integers, and molecules in the given order.
*   **Constraint:** "Each input will have only one way to balance the equation." This is crucial as it implies the underlying linear system has a one-dimensional null space, simplifying the solution process.

**Core Idea: Linear System of Equations**

Let's represent the equation `A + B -> C + D` as `x_A A + x_B B -> x_C C + x_D D`. For each element (e.g., Carbon, Hydrogen, Oxygen), the total number of atoms on the left side must equal the total on the right side.
This leads to a system of homogeneous linear equations:
` (count of Element E in A)*x_A + (count of E in B)*x_B - (count of E in C)*x_C - (count of E in D)*x_D = 0 `

We can build a matrix where rows represent elements and columns represent molecules. The entries are the stoichiometric coefficients (positive for reactants, negative for products). We then need to find a non-trivial (non-zero) vector `x` in the null space of this matrix.

**Steps:**

1.  **Parse the Equation:**
    *   Split the input string by ` -> ` to get left and right sides.
    *   Split each side by ` + ` to get individual molecule strings.
    *   For each molecule string (e.g., `C6H12O6`), parse it to get a map of elements to their counts (e.g., `{ C: 6, H: 12, O: 6 }`). A regular expression `([A-Z][a-z]?)(\d*)` can be used to extract element symbols and their numerical subscripts.

2.  **Identify Unique Elements:** Collect all unique element symbols present across all molecules in the entire equation. This will determine the number of rows in our stoichiometric matrix. Sort them for consistent matrix construction.

3.  **Construct the Stoichiometric Matrix:**
    *   Create a matrix `M` where `M[i][j]` represents the count of element `i` in molecule `j`.
    *   Elements from molecules on the *left* side of the equation get their counts as positive values.
    *   Elements from molecules on the *right* side of the equation get their counts as *negative* values.

4.  **Solve the Homogeneous System `Mx = 0`:**
    *   Use **Gaussian Elimination** to transform the matrix `M` into its Reduced Row Echelon Form (RREF).
    *   Since the problem guarantees a unique solution (up to scalar multiplication), the nullity of the matrix will be 1. This means there will be exactly one "free" variable.
    *   Identify the column corresponding to the free variable (a column that does not contain a leading 1 after RREF).
    *   Set the coefficient of this free variable to an arbitrary non-zero value (e.g., 1).
    *   Use back-substitution from the RREF to solve for the remaining "basic" variables (those corresponding to pivot columns). The resulting coefficients will likely be floating-point numbers.

5.  **Convert to Smallest Whole Integers:**
    *   The coefficients obtained from Gaussian elimination might be negative or fractional.
    *   First, ensure all coefficients are positive. If any are negative, multiply all coefficients by -1.
    *   To convert fractions to integers, find the least common multiple (LCM) of the denominators of all non-zero coefficients. A helper function `getImpliedDenominator` can infer the denominator of a floating-point number.
    *   Multiply all coefficients by this LCM.
    *   Finally, find the greatest common divisor (GCD) of all resulting integer coefficients and divide them all by this GCD to reduce them to the smallest possible whole integers.

6.  **Format the Output:**
    *   Reconstruct the equation string using the calculated integer coefficients.
    *   Coefficients of 1 should be omitted.
    *   Molecules must retain their original order.

**Example Walkthrough (H2 + O2 -> H2O):**

1.  **Molecules:** `m0=H2`, `m1=O2` (left), `m2=H2O` (right).
    *   `H2`: {H: 2}
    *   `O2`: {O: 2}
    *   `H2O`: {H: 2, O: 1}
2.  **Elements:** `H`, `O` (sorted).
3.  **Matrix:**
    ```
        H2  O2  H2O
    H [ 2   0   -2  ]
    O [ 0   2   -1  ]
    ```
4.  **Gaussian Elimination (to RREF):**
    *   `R1 -> R1 / 2`: `[[ 1, 0, -1 ], [ 0, 2, -1 ]]`
    *   `R2 -> R2 / 2`: `[[ 1, 0, -1 ], [ 0, 1, -0.5 ]]` (RREF)
    *   Pivot columns: 0 (for H2), 1 (for O2).
    *   Free variable column: 2 (for H2O).
    *   Set `x2 = 1`.
    *   From `R1`: `1*x0 + 0*x1 + (-1)*x2 = 0` => `x0 - x2 = 0` => `x0 = x2 = 1`.
    *   From `R2`: `0*x0 + 1*x1 + (-0.5)*x2 = 0` => `x1 - 0.5*x2 = 0` => `x1 = 0.5*x2 = 0.5`.
    *   Coefficients: `[1, 0.5, 1]` for `[H2, O2, H2O]`.
5.  **Convert to Integers:**
    *   Denominators: `getImpliedDenominator(1.0)=1`, `getImpliedDenominator(0.5)=2`.
    *   LCM of `[1, 2, 1]` is `2`.
    *   Multiply by `2`: `[2, 1, 2]`.
    *   GCD of `[2, 1, 2]` is `1`. No further reduction.
    *   Final coefficients: `[2, 1, 2]`.
6.  **Output:** `2H2 + O2 -> 2H2O`.