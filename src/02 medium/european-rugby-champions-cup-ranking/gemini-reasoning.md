The solution proceeds in several stages:

1.  **Input Parsing and Initial Data Setup**: Read pool definitions and game results. Initialize `TeamStats` objects for each team, storing their name, pool, and setting initial scores/points to zero. All game results are stored in a global array.
2.  **Calculate Initial Team Statistics**: Iterate through all 60 game results. For each game:
    *   Update `gamePointsScored` and `gamePointsConceded` for both participating teams.
    *   Calculate ranking points based on the rules: 4 for a win, 2 for a draw, 0 for a loss.
    *   Award bonus points: 1 point for scoring 4+ tries, and 1 point for a losing team if they lose by 7 points or less.
    *   Accumulate these points into the `rankingPoints` for each team.
    *   After processing all games, calculate `totalGameDiff` for each team (`gamePointsScored - gamePointsConceded`).
3.  **Intra-Pool Ranking**: For each of the 5 pools:
    *   Filter the global list of games to include only those played within the current pool. This is crucial for the head-to-head tie-breaker.
    *   Sort the 4 teams within the pool using a custom sorting function (`sortTeamsWithTieBreakers`). This function implements the intra-pool tie-breaking rules:
        1.  **Total Ranking Points**: Teams with more points rank higher.
        2.  **Total Game Points Difference**: If points are tied, teams with a better aggregate game points difference rank higher.
        3.  **Head-to-head (tied teams only)**: If still tied, the specific rule is applied. This involves identifying a group of teams tied by the first two criteria, then recalculating their points and game differences *only from the games played among themselves*. This re-sorted sub-group determines their final order within the tie.
    *   Assign the `positionInPool` ('Leader', 'Runner-Up', 'Third', 'Last') to each team in the sorted pool.
    *   The Leader and Runner-Up from each pool are added to a list of `qualifiedTeams`.
4.  **Inter-Pool Ranking**:
    *   From the `qualifiedTeams` list (which contains 5 Leaders and 5 Runners-Up), sort these 10 teams based on inter-pool ranking criteria:
        1.  **Pool Ranking**: Leaders rank higher than Runners-Up.
        2.  **Total Ranking Points**: Teams with more points rank higher.
        3.  **Total Game Points Difference**: If points are tied, teams with a better aggregate game points difference rank higher.
    *   Select the top 8 teams from this sorted list.
5.  **Quarter-Final Matchups**: Based on the final ranking of the 8 qualified teams, print the matchups as specified:
    *   #1 vs #8
    *   #2 vs #7
    *   #3 vs #6
    *   #4 vs #5

The `sortTeamsWithTieBreakers` function is the most complex part, as it handles the N-way tie-breaking using the "games involving tied teams" rule. It first sorts by total points and total difference. Then, it iterates through the sorted list, identifies contiguous groups of teams that are still tied, and re-sorts these groups based on their head-to-head performance within that specific group.