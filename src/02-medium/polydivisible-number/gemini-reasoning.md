The problem asks us to find all possible bases (from 2 to 36) in which a given number, represented by a sequence of base-10 digit values, is polydivisible. A number is polydivisible if:
1.  Its first digit is not 0.
2.  The number formed by its first two digits is a multiple of 2.
3.  The number formed by its first three digits is a multiple of 3.
4.  And so on, up to the number formed by all its digits being a multiple of the total number of digits.

**Input Parsing:**
The input is a string of space-separated pairs of numbers, like "04 04 00". Each pair represents a single digit's value in base 10. For example, "10" means the digit with value ten. We parse these strings into an array of integers, `digits`. For "04 04 00", `digits` becomes `[4, 4, 0]`.

**Base Validation:**
For a given number represented by the `digits` array to be valid in a `base`, every digit's value must be strictly less than the `base`. If the maximum digit value in `digits` is `maxDigitValue`, then any valid `base` must be `base > maxDigitValue`. We will iterate through bases from 2 to 36 and skip any `base` that doesn't meet this condition.

**Polydivisibility Check for a Given Base:**
For each potential `base`:
1.  **First Digit Check:** The problem states "Its first digit a is not 0". This means the *value* of the first digit (`digits[0]`) must not be 0. If it is, this number cannot be polydivisible in any base, and we can immediately disqualify the current base.
2.  **Iterative Divisibility Check:** We build the number incrementally.
    *   Let `currentNumber` store the value of the prefix formed by the first `k` digits.
    *   For `k = 1` to `digits.length`:
        *   Get the `k`-th digit's value (`digitValue = digits[k-1]`).
        *   Update `currentNumber`: `currentNumber = currentNumber * base + digitValue`.
        *   Check if `currentNumber` is divisible by `k`. If `currentNumber % k !== 0`, then this `base` is not valid. We can stop and move to the next `base`.

**Using `BigInt`:**
The number of digits can be up to 17, and the base can be up to 36. A number like 35 * 36^16 would exceed the maximum safe integer value in JavaScript's standard `Number` type. Therefore, it is crucial to use `BigInt` for all calculations involving `currentNumber` and `base`.

**Algorithm Steps:**
1.  Read the input line and split it into an array of digit strings.
2.  Parse each digit string into an integer to get the `digits` array.
3.  Find the `maxDigitValue` in the `digits` array.
4.  Initialize an empty array `possibleBases`.
5.  Loop `base` from 2 to 36:
    a.  If `base <= maxDigitValue`, `continue` to the next `base` (invalid base for these digits).
    b.  Initialize `isPolydivisible = true` and `currentNumberBigInt = 0n`.
    c.  Loop `k` from 1 to `digits.length`:
        i.   Get `digitValue = digits[k-1]`.
        ii.  If `k === 1` (first digit) and `digitValue === 0`, set `isPolydivisible = false` and `break` (violates "first digit not 0" rule).
        iii. Update `currentNumberBigInt = currentNumberBigInt * BigInt(base) + BigInt(digitValue)`.
        iv.  If `currentNumberBigInt % BigInt(k) !== 0n`, set `isPolydivisible = false` and `break`.
    d.  If `isPolydivisible` is still `true` after the inner loop, add `base` to `possibleBases`.
6.  Sort `possibleBases` numerically.
7.  Print each `base` in `possibleBases` on a new line.