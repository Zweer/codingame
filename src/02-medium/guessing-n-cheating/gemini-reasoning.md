The problem asks us to determine if Alice, who is playing a guessing game, has cheated based on a transcript of her responses. Alice thinks of a number between 1 and 100 (inclusive). Bob guesses a number, and Alice replies "too high", "too low", or "right on".

**Game Rules and Cheating Conditions:**

1.  **Initial Range:** The secret number is initially within the range `[1, 100]`.
2.  **Maintaining Possible Range:** We can track the possible range of the secret number by maintaining a `min_possible` and `max_possible` value.
    *   Initially, `min_possible = 1` and `max_possible = 100`.
3.  **Processing Each Round:** For each round, Bob guesses `G` and Alice replies `R_A`.
    *   **If `R_A` is "too high"**: The secret number must be less than `G`. We update `max_possible = min(max_possible, G - 1)`.
    *   **If `R_A` is "too low"**: The secret number must be greater than `G`. We update `min_possible = max(min_possible, G + 1)`.
    *   **If `R_A` is "right on"**: The secret number must be exactly `G`.
        *   **Cheating Check 1 (Consistency with Previous Rounds):** Before collapsing the range to `[G, G]`, we must first check if `G` is consistent with all *previous* statements. If `G` is outside the current `[min_possible, max_possible]` range (i.e., `G < min_possible` or `G > max_possible`), then Alice is cheating because she claimed `G` was correct, but previous statements ruled out `G`.
        *   If `G` is consistent, we then update `min_possible = G` and `max_possible = G`.
4.  **Cheating Check 2 (Invalid Range):** After processing a response and updating `min_possible` and `max_possible`, we check if `min_possible > max_possible`. If this condition becomes true, it means there is no number that can satisfy all the responses given so far. Alice has cheated.

**Identifying the First Cheat:**
As soon as any cheating condition is met in a round `X`, we output "Alice cheated in round X" and stop processing. If all rounds are processed without detecting any cheating, we output "No evidence of cheating".

**Example Walkthrough (from problem description):**
Input:
```
3
5 too high
1 too high
2 right on
```

Initial state: `min_possible = 1`, `max_possible = 100`

*   **Round 1 (i=1): "5 too high"**
    *   `max_possible = min(100, 5 - 1) = min(100, 4) = 4`.
    *   New range: `[1, 4]`.
    *   Check `min_possible > max_possible`: `1 <= 4`, no cheat.

*   **Round 2 (i=2): "1 too high"**
    *   `max_possible = min(4, 1 - 1) = min(4, 0) = 0`.
    *   New range: `[1, 0]`.
    *   Check `min_possible > max_possible`: `1 > 0` is true! This indicates a contradiction.
    *   Output: "Alice cheated in round 2". Stop.

This matches the example output, confirming the logic.