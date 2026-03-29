The problem requires us to count "Yes" and "No" votes, excluding invalid ones. There are three conditions for a vote to be invalid:

1.  **Invalid Vote Value:** The vote is neither "Yes" nor "No".
2.  **Voter Exceeded Limit:** The voter cast more votes than they were allowed. If this happens, *all* votes from that voter become invalid.
3.  **Unknown Voter:** The person who voted is not in the initial list of registered voters.

To handle these rules correctly, especially the cascading invalidation for voters who exceed their limit, a multi-pass approach is effective:

1.  **Parse Voter Limits:** Read the initial `N` lines to store each voter's name and their maximum allowed votes. A `Map<string, number>` (e.g., `voterLimits`) is suitable for this.
2.  **Store All Votes:** Read the `M` lines containing the actual votes and store them sequentially in an array (e.g., `allVotesCast`). This allows us to iterate over them multiple times.
3.  **Identify Invalid Voters:** Iterate through the `allVotesCast` array. For each vote:
    *   Check if the voter name exists in `voterLimits`. If not, add the voter to an `invalidVoters` `Set<string>`.
    *   If the voter is known and not already marked invalid, increment their `actualVoteCount` (using another `Map<string, number>`, e.g., `voterActualCounts`).
    *   If `actualVoteCount` for a voter exceeds their `voterLimits`, add that voter to the `invalidVoters` `Set`. This ensures that all their votes (even previous ones) are marked invalid.
4.  **Count Valid Votes:** Iterate through `allVotesCast` again. For each vote:
    *   Check if the voter is present in the `invalidVoters` `Set`. If they are, skip this vote.
    *   If the voter is valid, check the `voteValue`. If it's "Yes", increment a `yesCount`. If it's "No", increment a `noCount`. Any other value is simply ignored as it's neither "Yes" nor "No".
5.  **Output Result:** Print `yesCount` and `noCount` separated by a space.

This approach correctly handles the "all votes are invalid" rule by first identifying all invalid voters based on any condition (unknown or exceeding limit) and then filtering all votes in a final pass.

**Time Complexity:**
*   Reading voter limits: O(N)
*   Storing all votes: O(M)
*   Identifying invalid voters: O(M) (each vote processed once, map/set operations are O(1) on average).
*   Counting valid votes: O(M) (each vote processed once).
Given `N` and `M` are very small (less than 10), this solution is highly efficient.