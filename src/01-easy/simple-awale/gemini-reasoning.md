The problem asks us to simulate a single turn of the Awalé game. We are given the current state of both players' bowls and the index of the bowl chosen by "my" player. We need to calculate the new state of the bowls after the distribution of grains and determine if "my" player gets to play again.

Here's a breakdown of the rules and how they are implemented:

1.  **Game Board Representation:**
    *   Each player has 7 bowls: 6 regular bowls (indexed 0-5) and 1 reserve bowl (indexed 6).
    *   We use two separate arrays, `myBowls` and `oppBowls`, both of size 7, to store the grain counts.

2.  **Turn Start:**
    *   The player chooses a bowl `num` (0-5, excluding their reserve).
    *   All grains from `myBowls[num]` are picked up (`grainsInHand`).
    *   `myBowls[num]` is then set to 0.

3.  **Grain Distribution:**
    *   Grains are distributed one by one, starting from the bowl immediately after the chosen one, in a clockwise fashion.
    *   The distribution path follows: `my_bowls[num+1]`, ..., `my_bowls[5]`, `my_bowls[6]` (my reserve), `opp_bowls[0]`, ..., `opp_bowls[5]`, then back to `my_bowls[0]`, and so on.
    *   **Crucial Rule:** The *opponent's reserve* (`opp_bowls[6]`) is always skipped. Grains are never placed in it.

4.  **Replay Condition:**
    *   If the *final grain* distributed lands in "my" player's own reserve (`my_bowls[6]`), the player gets to play again.

**Implementation Strategy:**

To handle the circular distribution path and the skipping of the opponent's reserve efficiently, we can map all relevant bowls into a single conceptual circular path with "global" indices:

*   `myBowls[0]` to `myBowls[5]` correspond to global indices `0` to `5`.
*   `myBowls[6]` (my reserve) corresponds to global index `6`.
*   `oppBowls[0]` to `oppBowls[5]` correspond to global indices `7` to `12`.
*   `oppBowls[6]` (opponent's reserve) corresponds to global index `13`. This is the index to be skipped.

This means there are 13 valid bowls in the distribution cycle (0-12). When `currentPos` becomes 13, we skip it. When `currentPos` goes beyond 13 (i.e., becomes 14), it wraps around to `0`.

**Detailed Steps:**

1.  **Parse Input:** Read the two strings of bowl counts and the chosen bowl index `num`. Convert the strings into number arrays.
2.  **Initialize:** Store the number of grains from `myBowls[num]` into `grainsInHand` and set `myBowls[num]` to 0. Initialize `currentPos` to `num` (as the first grain will be placed at `currentPos + 1`). Initialize `replay` to `false` and `finalBowlPos` to -1.
3.  **Distribute Loop:**
    *   Loop while `grainsInHand` is greater than 0.
    *   In each iteration:
        *   Increment `currentPos`.
        *   Handle wrap-around: If `currentPos` exceeds `13` (meaning it's past the opponent's skipped reserve), reset `currentPos` to `0`.
        *   Check for opponent's reserve: If `currentPos` is `13`, use `continue` to skip the rest of the loop body for this iteration. This means no grain is placed, and `grainsInHand` is NOT decremented. The loop proceeds to the next bowl in the path.
        *   Place a grain: If `currentPos` is in `[0, 6]`, increment `myBowls[currentPos]`. Otherwise (if `currentPos` is in `[7, 12]`), increment `oppBowls[currentPos - 7]` (mapping global index to opponent's local index).
        *   Record `finalBowlPos = currentPos`.
        *   Decrement `grainsInHand`.
4.  **Check Replay:** After the loop finishes, if `finalBowlPos` is `6` (my reserve), set `replay` to `true`.
5.  **Format Output:** Print the `oppBowls` and `myBowls` in the specified format (space-separated with reserve in `[]`). If `replay` is `true`, print "REPLAY" on a new line.

**Example dry run (Example 3 from problem):**
Input:
`5 1 0 6 2 2 3` (oppBowls: [5,1,0,6,2,2,3])
`3 4 0 3 3 2 2` (myBowls: [3,4,0,3,3,2,2])
`3` (num)

1.  `grainsInHand = myBowls[3] = 3`. `myBowls` becomes `[3,4,0,0,3,2,2]`.
2.  `currentPos = 3`. `replay = false`. `finalBowlPos = -1`.

**Loop Iterations:**

*   **Grain 1:**
    *   `currentPos` becomes `4`.
    *   Not `13`.
    *   `myBowls[4]` becomes `4`. `myBowls`: `[3,4,0,0,4,2,2]`.
    *   `finalBowlPos = 4`. `grainsInHand` becomes `2`.
*   **Grain 2:**
    *   `currentPos` becomes `5`.
    *   Not `13`.
    *   `myBowls[5]` becomes `3`. `myBowls`: `[3,4,0,0,4,3,2]`.
    *   `finalBowlPos = 5`. `grainsInHand` becomes `1`.
*   **Grain 3:**
    *   `currentPos` becomes `6`.
    *   Not `13`.
    *   `myBowls[6]` (my reserve) becomes `3`. `myBowls`: `[3,4,0,0,4,3,3]`.
    *   `finalBowlPos = 6`. `grainsInHand` becomes `0`.

**Loop Ends.**

**Replay Check:** `finalBowlPos` (`6`) IS `6`. So, `replay` becomes `true`.

**Output:**
`5 1 0 6 2 2 [3]`
`3 4 0 0 4 3 [3]`
`REPLAY`

This matches the example output.