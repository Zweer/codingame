The puzzle asks us to validate credit card numbers using a specific variant of Luhn's algorithm. The challenge lies in accurately interpreting the rules, as the textual description ("Double every second digit from right to left") can be ambiguous and potentially conflict with the provided examples. By carefully analyzing the provided examples, we can deduce the exact rules used for calculation.

**Analysis of Luhn's Algorithm based on Examples:**

Let's consider a 16-digit card number `c0 c1 c2 c3 ... c15`, where `c0` is the leftmost digit and `c15` is the rightmost digit.

1.  **Rule 1: Doubling Digits**
    The problem statement says: "Double every second digit from right to left. If this 'doubling' results in a two-digit number, subtract 9 from it get a single digit."
    However, the examples' calculations (Test 1: `1 9 7 7 5 5 1 8` for `4556737586899855`; Test 2: `8 4 0 0 5 0 4 8` for `4024007109022143`) consistently show that the digits being doubled are those at **even 0-indexed positions from the left**: `c0, c2, c4, c6, c8, c10, c12, c14`.

    *   For `4556737586899855`:
        *   `c0=4`: `4*2=8`
        *   `c2=5`: `5*2=10 -> 1`
        *   `c4=7`: `7*2=14 -> 5`
        *   `c6=7`: `7*2=14 -> 5`
        *   `c8=8`: `8*2=16 -> 7`
        *   `c10=8`: `8*2=16 -> 7`
        *   `c12=9`: `9*2=18 -> 9`
        *   `c14=5`: `5*2=10 -> 1`
        Sum of these is `8+1+5+5+7+7+9+1 = 43`. This matches "Step 2" in Test 1.

    *   For `4024007109022143`:
        *   `c0=4`: `4*2=8`
        *   `c2=2`: `2*2=4`
        *   `c4=0`: `0*2=0`
        *   `c6=7`: `7*2=14 -> 5`
        *   `c8=0`: `0*2=0`
        *   `c10=0`: `0*2=0`
        *   `c12=2`: `2*2=4`
        *   `c14=4`: `4*2=8`
        Sum of these is `8+4+0+5+0+0+4+8 = 29`. This matches "Step 2" in Test 2.

2.  **Rule 3: Summing Other Digits**
    The problem statement says: "Add all digits in the odd places from right to left in the credit card number."
    Based on the digits that were *not* doubled in step 1 (i.e., those at odd 0-indexed positions from the left), these are `c1, c3, c5, c7, c9, c11, c13, c15`.

    *   For `4556737586899855`:
        *   `c1=5`
        *   `c3=6`
        *   `c5=3`
        *   `c7=5`
        *   `c9=6`
        *   `c11=9`
        *   `c13=8`
        *   `c15=5`
        Sum of these is `5+6+3+5+6+9+8+5 = 47`. This matches "Step 3" in Test 1.

    *   For `4024007109022143`:
        *   `c1=0`
        *   `c3=4`
        *   `c5=0`
        *   `c7=1`
        *   `c9=9`
        *   `c11=2`
        *   `c13=1`
        *   `c15=3`
        Sum of these is `0+4+0+1+9+2+1+3 = 20`. This matches "Step 3" in Test 2.

3.  **Final Check:**
    *   Sum the results from step 1 (doubled digits sum) and step 3 (other digits sum).
    *   If the total sum is divisible by 10, the card is `YES`, otherwise `NO`.

This interpretation, which prioritizes the example calculations over the potentially ambiguous textual description, consistently yields the correct results for both provided test cases.

**Implementation Steps:**

1.  Read the number of cards `N`.
2.  Loop `N` times:
    a.  Read the credit card number as a string, including spaces.
    b.  Remove all spaces to get a single 16-digit string.
    c.  Initialize two sums: `sumEvenIndices` (for doubled digits) and `sumOddIndices` (for direct digits).
    d.  Iterate through the cleaned 16-digit string using a 0-indexed loop from left to right.
    e.  For each digit:
        i.  Convert the character to an integer.
        ii. If the current index is even (`j % 2 === 0`):
            1.  Double the digit.
            2.  If the doubled value is 10 or more, subtract 9 from it.
            3.  Add this processed digit to `sumEvenIndices`.
        iii. If the current index is odd (`j % 2 !== 0`):
            1.  Add the digit directly to `sumOddIndices`.
    f.  Calculate `totalSum = sumEvenIndices + sumOddIndices`.
    g.  Print `YES` if `totalSum % 10 === 0`, otherwise print `NO`.