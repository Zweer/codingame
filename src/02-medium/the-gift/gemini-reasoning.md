The problem asks us to distribute the cost of a gift among `N` participants, each with a maximum budget, such that no one pays more than their budget, and the contributions are as fair as possible. Fairness is defined by minimizing the highest contribution, then the second highest, and so on (lexicographical minimization of the sorted contributions). All contributions must be integers.

Here's the reasoning behind the solution:

1.  **Initial Feasibility Check:**
    First, we need to determine if it's even possible to buy the gift. This is straightforward: sum up all participants' maximum budgets. If this sum is less than the gift's price (`C`), then it's `IMPOSSIBLE` to buy the gift, and we should output "IMPOSSIBLE".

2.  **Sorting Budgets:**
    The core of the fairness rule ("minimizing the highest contribution, then the second highest, etc.") implies we want to keep individual contributions as close to an average as possible. This strategy is most effective when considering participants in order of their budgets. By sorting the budgets in ascending order, we can process participants from those with the smallest maximum budgets to those with the largest.

3.  **Greedy Distribution Strategy:**
    We maintain `remainingCost` (the amount still to be paid) and `numRemainingParticipants` (the number of people who still need to contribute). We iterate through the sorted budgets:

    *   **For each participant (`currentBudget`):**
        *   Calculate the `idealAveragePayment` if the `remainingCost` were to be split equally among the `numRemainingParticipants`.
        *   **Case 1: `currentBudget <= idealAveragePayment`**
            If a participant's maximum budget is less than or equal to this `idealAveragePayment`, they *must* pay their full `currentBudget`. They are a limiting factor; even if everyone else could pay the `idealAveragePayment`, this person cannot. By making them pay their maximum, we extract as much as possible from the "lowest capacity" individuals first. We then subtract `currentBudget` from `remainingCost` and decrement `numRemainingParticipants`.
        *   **Case 2: `currentBudget > idealAveragePayment`**
            If a participant's maximum budget is greater than the `idealAveragePayment`, it means this participant *and all subsequent participants* (because budgets are sorted) can afford to pay at least the `idealAveragePayment`. At this point, we have identified a group of `numRemainingParticipants` people who can collectively cover the `remainingCost`. To satisfy the fairness rules (minimize highest, then second highest, etc.), we should distribute the `remainingCost` among these `numRemainingParticipants` as evenly as possible.
            *   Calculate `basePayment = Math.floor(remainingCost / numRemainingParticipants)`.
            *   Calculate `remainder = remainingCost % numRemainingParticipants`.
            *   This means `remainder` participants will pay `basePayment + 1`, and `numRemainingParticipants - remainder` participants will pay `basePayment`.
            *   To maintain the lexicographical minimum of sorted contributions (and ensure the output is sorted as required), we assign `basePayment` to the `numRemainingParticipants - remainder` participants with lower indices in the `budgets` array (i.e., smaller initial budgets), and `basePayment + 1` to the `remainder` participants with higher indices (larger initial budgets). Once this distribution is done for all remaining participants, we can stop, as the problem is solved.

4.  **Output:**
    The `payments` array, constructed using this strategy, will inherently be sorted in ascending order. We simply print each payment on a new line.

**Example Walkthrough (Example 2 from problem description):**
`N = 3`, `C = 100`, Budgets: `[3, 100, 100]`

1.  **Sorted Budgets:** `[3, 100, 100]`
2.  **Total Budget Sum:** `3 + 100 + 100 = 203`. `203 >= 100`, so possible.
3.  **Initialization:** `payments = [_, _, _]`, `remainingCost = 100`, `numRemainingParticipants = 3`.

    *   **Iteration `i = 0` (budget `3`):**
        *   `currentBudget = 3`.
        *   `idealAveragePayment = 100 / 3 = 33.33...`
        *   `3 <= 33.33...` (Case 1 applies).
        *   `payments[0] = 3`.
        *   `remainingCost = 100 - 3 = 97`.
        *   `numRemainingParticipants = 3 - 1 = 2`.

    *   **Iteration `i = 1` (budget `100`):**
        *   `currentBudget = 100`.
        *   `idealAveragePayment = 97 / 2 = 48.5`.
        *   `100 > 48.5` (Case 2 applies).
        *   `basePayment = Math.floor(97 / 2) = 48`.
        *   `remainder = 97 % 2 = 1`.
        *   Distribute payments for the `numRemainingParticipants` (currently 2) starting from index `i = 1`:
            *   For `j = 0` (`payments[1]`): `0 < (2 - 1)` (i.e., `0 < 1`) is true. `payments[1] = basePayment = 48`.
            *   For `j = 1` (`payments[2]`): `1 < (2 - 1)` (i.e., `1 < 1`) is false. `payments[2] = basePayment + 1 = 49`.
        *   Break the loop.

4.  **Final Payments:** `[3, 48, 49]`. This matches the example output and is sorted.

This approach ensures optimal fairness and correct integer contributions.