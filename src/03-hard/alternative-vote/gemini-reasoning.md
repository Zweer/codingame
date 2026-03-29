The problem asks us to simulate an alternative vote electoral system. In this system, voters provide a ranked list of candidates. Candidates are eliminated one by one based on having the fewest votes. When a candidate is eliminated, the votes that went to them are transferred to the voter's next preferred candidate who is still in the election. This process continues until only one candidate remains, who is then declared the winner. Tie-breaking for elimination is based on the candidate's original input order (earlier in the input list means eliminated first in a tie).

Here's a breakdown of the solution approach:

1.  **Input Reading**:
    *   Read `C`, the number of candidates.
    *   Read `C` candidate names and store them in an array, mapping their 1-based ID to their name.
    *   Read `V`, the number of voters.
    *   Read `V` voter preference lists. Each list is an array of candidate IDs in preference order.

2.  **Election State**:
    *   Maintain a `Set` of `activeCandidateIds` to efficiently check which candidates are still in the running and to remove eliminated candidates. Initially, all candidates are active.
    *   An array `eliminatedOrder` will store the names of candidates as they are eliminated, in order.

3.  **Election Rounds Loop**:
    *   The core of the simulation is a `while` loop that continues as long as `activeCandidateIds.size` is greater than 1.
    *   **Vote Counting**: Inside each round:
        *   Initialize a `Map` (`currentVotes`) to store vote counts for active candidates in the current round, setting all to 0.
        *   For each voter's preference list:
            *   Iterate through their preferred candidates from most preferred to least preferred.
            *   The *first* candidate in their list that is still `active` receives their vote. Once a vote is cast, move to the next voter.
    *   **Elimination Decision**:
        *   Find the candidate with the minimum number of votes among all `active` candidates.
        *   **Tie-breaking**: To handle ties (equal minimum votes), we need to eliminate the candidate who appeared *first* in the original input list (which corresponds to the lowest candidate ID). By iterating through the `activeCandidateIds` in ascending order (e.g., converting the `Set` to an `Array` and sorting it), the first candidate encountered with the minimum votes will naturally be the one with the lowest ID, thus correctly breaking ties.
        *   Once the candidate to eliminate is identified, remove their ID from `activeCandidateIds` and add their name to the `eliminatedOrder` array.

4.  **Output**:
    *   After the loop finishes (only one candidate remains), print the names in `eliminatedOrder`.
    *   Finally, print the winner's name in the specified format: `winner:NAME`.

**Data Structures Used:**
*   `candidateNames: string[]`: Stores names, `candidateNames[id-1]` gives the name for 1-based `id`.
*   `voterPreferences: number[][]`: Stores each voter's full ranked list of candidate IDs.
*   `activeCandidateIds: Set<number>`: Efficiently tracks active candidates.
*   `currentVotes: Map<number, number>`: Stores vote counts for the current round.

This approach correctly handles the vote transfer logic, tie-breaking, and the iterative elimination process as described in the problem.