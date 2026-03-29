The problem asks us to analyze the "clumping" behavior of a large number `N` for different bases `B` (from 1 to 9). For a given `N` and `B`, we need to split `N` into the *minimum* number of contiguous segments (clumps) such that all digits `D` within each clump have the same remainder when divided by `B` (i.e., `D % B` is constant for all digits in that clump). We then determine if the number of clumps *decreases* when moving from `B` to `B+1`. The first `B` for which this decrease happens is the answer. If the number of clumps never decreases (always stays the same or increases) for `B` from 1 to 9, then the output is "Normal".

**1. Counting Clumps (`countClumps` function):**
To find the *minimum* number of clumps, a greedy strategy works perfectly. We iterate through the digits of `N` from left to right:
* Start a new clump with the first digit. Record its remainder `D % B`.
* For subsequent digits, if the digit's remainder `D % B` is the same as the current clump's remainder, extend the current clump.
* If the digit's remainder is different, the current clump must end, and a new clump begins with this digit. Increment the clump count and update the current clump's remainder.

This greedy approach ensures the minimum number of clumps because it always tries to extend the current clump as much as possible, only starting a new one when strictly necessary.

**Example Walkthrough (N=157285, B=2):**
Digits: `1`, `5`, `7`, `2`, `8`, `5`
Remainders % 2: `1`, `1`, `1`, `0`, `0`, `1`

1. **'1'**: `1 % 2 = 1`. Start new clump. Clump count = 1. Current clump remainder = 1. Clumps: `[1]`
2. **'5'**: `5 % 2 = 1`. Matches current remainder. Extend clump. Clumps: `[15]`
3. **'7'**: `7 % 2 = 1`. Matches current remainder. Extend clump. Clumps: `[157]`
4. **'2'**: `2 % 2 = 0`. Does NOT match (1). Start new clump. Clump count = 2. Current clump remainder = 0. Clumps: `[157, 2]`
5. **'8'**: `8 % 2 = 0`. Matches current remainder. Extend clump. Clumps: `[157, 28]`
6. **'5'**: `5 % 2 = 1`. Does NOT match (0). Start new clump. Clump count = 3. Current clump remainder = 1. Clumps: `[157, 28, 5]`

End of digits. Total clumps: 3.

**2. Main Logic:**
* We need to iterate `B` from 1 to 9.
* We keep track of the `previousClumpCount` (clumps for `B-1`).
* For each `B`, calculate `currentClumpCount` using the `countClumps` function.
* If `previousClumpCount` is defined (i.e., not the very first iteration for `B=1`) AND `currentClumpCount < previousClumpCount`, we've found the first deviation. Print `B` and terminate.
* If the loop finishes without finding such a `B`, print "Normal".

**Constraints:**
* `N` is given as a string, as it can be very large (up to 1000 digits). This is handled by processing `N` as a string and converting each character digit to an integer for modulo operations.
* `B` is a single-digit positive number (1-9). The loop covers this range.

**Time Complexity:**
The `countClumps` function iterates through the digits of `N` once, which takes `O(L)` time, where `L` is the number of digits in `N`. The main loop runs 9 times (for `B` from 1 to 9). Therefore, the total time complexity is `9 * O(L)`, which simplifies to `O(L)`. Given `L` up to 1000, this is highly efficient.