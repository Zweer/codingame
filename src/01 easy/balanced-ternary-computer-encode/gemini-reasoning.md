The problem asks us to convert a given decimal integer `N` into its balanced ternary representation. In balanced ternary, the base is 3, and the allowed digits are -1, 0, and 1. We use 'T' to represent -1.

**Understanding Balanced Ternary Conversion**

Standard base conversion involves repeatedly dividing the number by the base and taking the remainder. For balanced ternary, the twist is that the remainder should correspond to one of the allowed digits {-1, 0, 1}.

Let's say we have a number `N` and we want to find its last balanced ternary digit `d0`. We know `N = q * 3 + d0`, where `d0` is -1, 0, or 1. This implies that `(N - d0)` must be perfectly divisible by 3.

Consider `N % 3` (the remainder when `N` is divided by 3). In JavaScript, the `%` operator returns a remainder with the same sign as the dividend. So, for `N = 8`, `8 % 3` is `2`. For `N = -2`, `-2 % 3` is `-2`.

We need to map these possible remainders to the balanced ternary digits {-1, 0, 1} and determine the next number to process (`N_next`).

1.  **If `N % 3 === 0`:**
    *   The digit `d0` is `0`.
    *   The next number `N_next` is `N / 3`.
    *   Example: `N = 6`. `6 % 3 = 0`. `d0 = '0'`. `N_next = 6 / 3 = 2`.

2.  **If `N % 3 === 1`:**
    *   The digit `d0` is `1`.
    *   The next number `N_next` is `(N - 1) / 3`.
    *   Example: `N = 8`. `8 % 3 = 2`. This case is not `1`.
    *   Example: `N = 1`. `1 % 3 = 1`. `d0 = '1'`. `N_next = (1 - 1) / 3 = 0`.

3.  **If `N % 3 === 2`:**
    *   Since 2 is not an allowed digit, we need to adjust. We can express `N = 3q + 2` as `N = 3(q+1) - 1`.
    *   So, the digit `d0` must be `-1` ('T').
    *   The next number `N_next` is `(N + 1) / 3`.
    *   Example: `N = 8`. `8 % 3 = 2`. `d0 = 'T'`. `N_next = (8 + 1) / 3 = 3`.

4.  **If `N % 3 === -1`:**
    *   The digit `d0` is `-1` ('T').
    *   The next number `N_next` is `(N + 1) / 3`.
    *   Example: `N = -1`. `-1 % 3 = -1`. `d0 = 'T'`. `N_next = (-1 + 1) / 3 = 0`.

5.  **If `N % 3 === -2`:**
    *   Similar to `N % 3 === 2`, we adjust. We can express `N = 3q - 2` as `N = 3(q-1) + 1`.
    *   So, the digit `d0` must be `1`.
    *   The next number `N_next` is `(N - 1) / 3`.
    *   Example: `N = -2`. `-2 % 3 = -2`. `d0 = '1'`. `N_next = (-2 - 1) / 3 = -1`.

**Algorithm Summary:**

Initialize an empty array `balancedTernaryDigits` to store the digits.
Use a variable `currentN` initialized with the input `N`.

If `N` is 0, the result is "0".

While `currentN` is not 0:
1.  Calculate `remainder = currentN % 3`.
2.  Based on `remainder`:
    *   If `remainder === 0`: Add '0' to `balancedTernaryDigits`. Set `currentN = currentN / 3`.
    *   If `remainder === 1` or `remainder === -2`: Add '1' to `balancedTernaryDigits`. Set `currentN = (currentN - 1) / 3`.
    *   If `remainder === -1` or `remainder === 2`: Add 'T' to `balancedTernaryDigits`. Set `currentN = (currentN + 1) / 3`.
    *(Note: The divisions will always result in an integer, so regular `/` operator is fine in JavaScript.)*

After the loop, the `balancedTernaryDigits` array will contain the digits in reverse order (least significant first). Reverse the array and join its elements to form the final string.

**Example Trace for N = 8:**

1.  `currentN = 8`. `balancedTernaryDigits = []`.
2.  Loop: `currentN` is not 0.
    *   `remainder = 8 % 3 = 2`.
    *   `remainder === 2` case: Add 'T' to `balancedTernaryDigits`. `balancedTernaryDigits = ['T']`.
    *   `currentN = (8 + 1) / 3 = 9 / 3 = 3`.
3.  Loop: `currentN` is not 0.
    *   `remainder = 3 % 3 = 0`.
    *   `remainder === 0` case: Add '0' to `balancedTernaryDigits`. `balancedTernaryDigits = ['T', '0']`.
    *   `currentN = 3 / 3 = 1`.
4.  Loop: `currentN` is not 0.
    *   `remainder = 1 % 3 = 1`.
    *   `remainder === 1` case: Add '1' to `balancedTernaryDigits`. `balancedTernaryDigits = ['T', '0', '1']`.
    *   `currentN = (1 - 1) / 3 = 0 / 3 = 0`.
5.  Loop: `currentN` is 0. Terminate.

Result: `balancedTernaryDigits` is `['T', '0', '1']`. Reverse it: `['1', '0', 'T']`. Join: `"10T"`. This matches the example.

**Code Structure:**



```typescript
/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

const N: number = parseInt(readline());

let balancedTernaryDigits: string[] = [];
let currentN: number = N;

if (currentN === 0) {
    console.log('0');
} else {
    while (currentN !== 0) {
        let remainder: number = currentN % 3;

        // If remainder is 0, the digit is 0.
        // The next number is currentN / 3.
        if (remainder === 0) {
            balancedTernaryDigits.push('0');
            currentN /= 3;
        } 
        // If remainder is 1 (e.g., 1, 4, 7, ...)
        // OR if remainder is -2 (e.g., -2, -5, -8, ...), which effectively means N = 3k + 1 for some integer k.
        // In these cases, the balanced ternary digit is 1.
        // The next number is (currentN - 1) / 3.
        else if (remainder === 1 || remainder === -2) {
            balancedTernaryDigits.push('1');
            currentN = (currentN - 1) / 3;
        } 
        // If remainder is -1 (e.g., -1, -4, -7, ...)
        // OR if remainder is 2 (e.g., 2, 5, 8, ...), which effectively means N = 3k - 1 for some integer k.
        // In these cases, the balanced ternary digit is -1 ('T').
        // The next number is (currentN + 1) / 3.
        else { // remainder === -1 or remainder === 2
            balancedTernaryDigits.push('T');
            currentN = (currentN + 1) / 3;
        }
    }

    // The digits are collected from the least significant to the most significant.
    // Reverse the array and join its elements to form the final balanced ternary string.
    console.log(balancedTernaryDigits.reverse().join(''));
}
```