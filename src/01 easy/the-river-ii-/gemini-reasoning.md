The problem asks us to determine if a given integer `r1` can be a meeting point for "two or more" digital rivers. A digital river is a sequence where each number `n` is followed by `n + sum_of_digits(n)`. A river K starts with the value K.

**Understanding the Meeting Point Condition:**
If `r1` is a meeting point of two or more digital rivers, it means `r1` appears in at least two distinct river sequences. One obvious river that contains `r1` is `river r1` itself (since it starts with `r1`). Therefore, to be a meeting point for "two or more" rivers, `r1` must also be part of at least one *other* river, let's call it `river X`, where `X` is different from `r1`.

For `r1` to be part of `river X`, it means there's a sequence `X, n_1, n_2, ..., n_m, r1` where each subsequent number is generated by adding the sum of its digits, and `X` is the starting point of the river. If `r1` is not the *start* of `river X` (i.e., `X != r1`), then `r1` must have been generated from some previous number `P` in `river X`, such that `P + sum_of_digits(P) = r1`.

**Key Insight and Optimization:**
Since `sum_of_digits(P)` is always positive for `P > 0`, it implies that `P` must be less than `r1`.
So, the problem boils down to finding if there exists *any* integer `X` such that `1 <= X < r1` and `X + sum_of_digits(X) = r1`. If such an `X` is found, then `river X` contains `r1`, and since `river r1` also contains `r1`, `r1` is indeed a meeting point for at least two rivers. If no such `X` exists after checking all possibilities, then `r1` cannot be a meeting point for two or more rivers.

The constraints specify `1 <= r1 < 100000`.
Let's consider the maximum possible value for `sum_of_digits(X)` for `X < 100000`. The largest sum of digits occurs for `99999`, which is `9 + 9 + 9 + 9 + 9 = 45`. For any `X` in this range, `sum_of_digits(X)` will be between 1 and 45.
Since `X + sum_of_digits(X) = r1`, it means `X = r1 - sum_of_digits(X)`.
Because `sum_of_digits(X)` is at most 45, `X` must be at least `r1 - 45`.
This significantly narrows down the search space for `X`. Instead of iterating `X` from `1` to `r1 - 1`, we only need to check `X` values from `Math.max(1, r1 - 45)` up to `r1 - 1`. This search range has a maximum size of 45 iterations, making the solution very efficient.

**Algorithm:**
1. Define a helper function `sumDigits(n)` that calculates the sum of the digits of a given number `n`.
2. Read the input integer `r1`.
3. Initialize a boolean flag `isMeetingPoint` to `false`.
4. Determine the lower bound for the search loop: `lowerBound = Math.max(1, r1 - 45)`.
5. Loop `X` from `lowerBound` up to `r1 - 1`:
   a. Calculate `nextValueInRiverX = X + sumDigits(X)`.
   b. If `nextValueInRiverX` is equal to `r1`, set `isMeetingPoint` to `true` and break the loop (as we've found a valid `X`).
6. After the loop, if `isMeetingPoint` is `true`, print "YES". Otherwise, print "NO".

**Example Trace (r1 = 20):**
- `r1 = 20`
- `lowerBound = Math.max(1, 20 - 45) = Math.max(1, -25) = 1`
- Loop `X` from `1` to `19`:
    - `X = 1: 1 + sumDigits(1) = 1 + 1 = 2 != 20`
    - ...
    - `X = 14: 14 + sumDigits(14) = 14 + 5 = 19 != 20`
    - `X = 15: 15 + sumDigits(15) = 15 + 6 = 21 != 20`
    - ...
    - `X = 19: 19 + sumDigits(19) = 19 + 10 = 29 != 20`
- No `X` found that satisfies `X + sumDigits(X) = 20`.
- `isMeetingPoint` remains `false`.
- Output: `NO`. (Matches example)

**Example Trace (r1 = 47):**
- `r1 = 47`
- `lowerBound = Math.max(1, 47 - 45) = Math.max(1, 2) = 2`
- Loop `X` from `2` to `46`:
    - ...
    - `X = 37: 37 + sumDigits(37) = 37 + (3+7) = 37 + 10 = 47`.
    - Found a match! Set `isMeetingPoint = true` and break.
- Output: `YES`. (River 37 reaches 47, and River 47 starts with 47, so they meet at 47).