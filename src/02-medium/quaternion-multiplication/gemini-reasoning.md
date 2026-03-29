The puzzle asks us to multiply a sequence of quaternions and output the simplified result in a specific format. A quaternion is represented as `ai + bj + ck + d`, where `a, b, c, d` are scalar coefficients.

Here's a breakdown of the solution:

1.  **Quaternion Representation**:
    A quaternion can be naturally represented by a class with four numeric properties: `i`, `j`, `k`, and `s` (for scalar or real part).

2.  **Quaternion Multiplication Logic**:
    Given two quaternions, `q1 = s1 + a1*i + b1*j + c1*k` and `q2 = s2 + a2*i + b2*j + c2*k`, their product `q1 * q2` is calculated using the distributive property and the fundamental quaternion multiplication rules (`ij=k`, `jk=i`, `ki=j`, `i²=j²=k²=-1`, and their non-commutative counterparts like `ji=-k`).
    The resulting quaternion `q_result = S + A*i + B*j + C*k` has components:
    *   `S = s1*s2 - a1*a2 - b1*b2 - c1*c2`
    *   `A = s1*a2 + a1*s2 + b1*c2 - c1*b2`
    *   `B = s1*b2 + b1*s2 + c1*a2 - a1*c2`
    *   `C = s1*c2 + c1*s2 + a1*b2 - b1*a2`
    These formulas are implemented in the `multiply` method of the `Quaternion` class.

3.  **Parsing Input Quaternions**:
    The input is a string like `(2i+2j)(j+1)`.
    *   First, we extract each bracketed expression using a regular expression `/\((.*?)\)/g`. This gives us an array of strings like `["(2i+2j)", "(j+1)"]`.
    *   For each such string, we remove the parentheses and then parse the inner content (e.g., "2i+2j").
    *   The `parseQuaternionString` function handles this. It iterates through the terms in the string (e.g., `2i`, `+2j`, `-2`). A regular expression `([+-])(\d*)?([ijk])?/g` is used to match individual terms, extracting the sign, coefficient (if present, otherwise assumed to be 1), and unit (`i`, `j`, `k`, or scalar). These values are then accumulated into the `i`, `j`, `k`, and `s` components of a `Quaternion` object.

4.  **Sequential Multiplication**:
    We initialize a `resultQuaternion` to the multiplicative identity `(0i + 0j + 0k + 1)`. Then, for each parsed quaternion from the input expression, we multiply it with the `resultQuaternion` sequentially. The order of multiplication is crucial due to non-commutativity.

5.  **Output Formatting**:
    The `toString` method of the `Quaternion` class formats the final result according to the specified rules:
    *   Terms are ordered: `i`, `j`, `k`, then scalar.
    *   Coefficients of `1` or `-1` are omitted (e.g., `i` instead of `1i`, `-j` instead of `-1j`).
    *   Terms with a coefficient of `0` are omitted.
    *   Positive terms after the first one are prefixed with a `+` (e.g., `2i+2j`). Negative terms intrinsically include their sign (e.g., `2i-2`).
    *   If all components are zero, the output is `0`.

**Example Walkthrough (from problem description):**
`(2i+2j)(j+1)`

1.  **Parsing:**
    *   `(2i+2j)` parses to `q1 = new Quaternion(2, 2, 0, 0)`
    *   `(j+1)` parses to `q2 = new Quaternion(0, 1, 0, 1)`
2.  **Multiplication (q1 * q2):**
    `q1 = (0 + 2i + 2j + 0k)`
    `q2 = (1 + 0i + 1j + 0k)`
    Applying the multiplication formulas:
    *   `new_i = 0*0 + 2*1 + 2*0 - 0*1 = 2`
    *   `new_j = 0*1 + 2*0 + 0*0 - 2*0 = 0`
    *   `new_k = 0*0 + 0*1 + 2*1 - 2*0 = 2`
    *   `new_s = 0*1 - 2*0 - 2*1 - 0*0 = -2`
    Result: `new Quaternion(2, 0, 2, -2)`
    Wait, the example says `(2i+2j+2k-2)`. My `j` term is `0` but `2` in example. Let's re-check the example's intermediate step `(2ij+2i+2j² +2j)`.
    `2ij = 2k`
    `2i`
    `2j² = 2(-1) = -2`
    `2j`
    Summing these: `2k + 2i - 2 + 2j`. Reordering: `2i + 2j + 2k - 2`.
    This means my manual calculation of `q1 * q2` was wrong.
    Let's re-do the `q1 * q2` with `a1=2, b1=2, c1=0, s1=0` and `a2=0, b2=1, c2=0, s2=1`.
    *   `new_i = s1*a2 + a1*s2 + b1*c2 - c1*b2`
        `= 0*0 + 2*1 + 2*0 - 0*1 = 2` (Correct for `i`)
    *   `new_j = s1*b2 + b1*s2 + c1*a2 - a1*c2`
        `= 0*1 + 2*1 + 0*0 - 2*0 = 2` (This was `0` before, now `2`. Correct for `j`)
    *   `new_k = s1*c2 + c1*s2 + a1*b2 - b1*a2`
        `= 0*0 + 0*1 + 2*1 - 2*0 = 2` (Correct for `k`)
    *   `new_s = s1*s2 - a1*a2 - b1*b2 - c1*c2`
        `= 0*1 - 2*0 - 2*1 - 0*0 = -2` (Correct for `s`)
    The calculated result `new Quaternion(2, 2, 2, -2)` matches the example's result. My initial manual error was in `new_j` calc. The code's multiplication formula is correct.

3.  **Output Formatting:**
    `new Quaternion(2, 2, 2, -2)` will be formatted as `2i+2j+2k-2`, matching the example.

The solution uses standard TypeScript features and `readline` for input/output, which is common in CodinGame. Coefficients can be up to `10^9`, and `number` in TypeScript (double-precision floating point) can safely handle integer arithmetic up to `2^53 - 1` (approx `9 * 10^15`). The maximum value for a product term would be `10^9 * 10^9 = 10^18`, which fits within `number` precision without issues.