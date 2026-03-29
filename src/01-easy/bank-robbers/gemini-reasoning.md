The problem asks us to calculate the total time a bank heist takes, given the number of robbers, the number of vaults, and the specifications for cracking each vault.

Here's a breakdown of the logic:

1.  **Calculate vault cracking time:**
    *   For each vault, the combination has `C` characters.
    *   The first `N` characters are digits (0-9), so there are 10 possibilities for each of these `N` positions. The number of combinations for the digit part is `10^N`.
    *   The remaining `C - N` characters are vowels (A, E, I, O, U), so there are 5 possibilities for each of these `C - N` positions. The number of combinations for the vowel part is `5^(C - N)`.
    *   The total number of combinations for a vault is `10^N * 5^(C - N)`.
    *   Since each combination takes 1 second, this product also represents the time one robber takes to crack that specific vault.

2.  **Simulate robber assignments:**
    *   We have `R` robbers working in parallel.
    *   Vaults must be processed in increasing order of their index (0, 1, ..., V-1).
    *   When a robber finishes a vault, they immediately move to the next *available* vault (the one with the smallest index not yet assigned).
    *   The heist finishes when all vaults have been cracked.

3.  **Scheduling Strategy (Greedy Approach):**
    This is a classic scheduling problem. We want to minimize the overall time. A greedy approach works well here: always assign the *next* vault (in increasing order) to the robber who will become *free earliest*.

    *   We'll maintain an array, `robberFreeTime`, of size `R`. Each element `robberFreeTime[i]` will store the time (in seconds) when robber `i` finishes their current task and becomes available for a new one. Initially, all robbers are free at time 0, so `robberFreeTime` is filled with zeros.
    *   Iterate through the vaults from `0` to `V-1`:
        *   For the current vault, calculate its `combinations` (which is also its cracking time).
        *   Find the robber `k` who has the minimum value in `robberFreeTime`. This is the robber who will be available earliest.
        *   Assign the current vault to robber `k`.
        *   Update `robberFreeTime[k]` by adding the vault's cracking time to their current free time: `robberFreeTime[k] = robberFreeTime[k] + combinations`.
    *   After processing all `V` vaults, the total time for the heist will be the maximum value in the `robberFreeTime` array. This is because the heist is only complete when the *last* robber finishes their *last* assigned vault.

**Example Walkthrough (from problem description):**
Input:
R = 1
V = 1
Vault 0: C=3, N=1

1.  Initialize `robberFreeTime = [0]` (for 1 robber).
2.  **Vault 0 (C=3, N=1):**
    *   Combinations = `10^1 * 5^(3-1) = 10 * 5^2 = 10 * 25 = 250`.
    *   Find earliest free robber: Robber 0 (free at time 0).
    *   Assign Vault 0 to Robber 0.
    *   Update `robberFreeTime[0] = 0 + 250 = 250`.
    *   `robberFreeTime` is now `[250]`.
3.  All vaults processed.
4.  Total heist time = `max(robberFreeTime) = max(250) = 250`.

This approach correctly models the simultaneous work and sequential vault processing.

**Constraints check:**
*   `R` is small (1 to 5), so finding the earliest free robber (min value in `robberFreeTime`) is efficient.
*   `V` is small (1 to 20), so iterating through vaults is fast.
*   `C` (3 to 8) and `N` (0 to C) lead to a maximum of `10^8` combinations (`C=8, N=8`). The total time can be up to `20 * 10^8 = 2 * 10^9`. These numbers fit comfortably within standard integer types (TypeScript's `number` type, being a 64-bit floating point, handles integers up to `2^53 - 1` precisely).