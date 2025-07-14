The goal of this puzzle is to capture the opponent's HQ. If that's not possible within 250 turns, the player who owns the most zones wins. This requires a strategy that balances aggressive pushes towards the enemy HQ with resource gathering (platinum) and territorial expansion.

**Core Strategy:**

1.  **Map Representation:**
    *   The game board is a graph of hexagonal zones. We represent this using `Zone` objects, each with an ID, a list of neighboring zone IDs, ownership, POD counts, visibility, and platinum information.
    *   `knownPlatinum` is crucial due to the fog of war. Even if a zone becomes invisible, we remember its last known platinum value to prioritize future captures.

2.  **HQ Identification:**
    *   My HQ and the enemy HQ are always visible from the first turn. We identify and store their `zoneId`s (`myHQId`, `enemyHQId`) in the first game turn.

3.  **Pathfinding (BFS):**
    *   To effectively attack the enemy HQ, we need to know the shortest path from any of our owned zones to it. A Breadth-First Search (BFS) is used at the start of each turn to calculate `distanceToEnemyHQ` for all zones. This helps direct our PODs.

4.  **POD Movement Priorities (Greedy Approach):**
    Each turn, for every zone we own that has available PODs, we prioritize actions in the following order:

    *   **Priority 1: Retreat from Losing Fights:** If our PODs on a zone are outnumbered by enemy PODs (and thus likely to be lost), and the zone is currently in combat, we try to retreat all available PODs to an adjacent owned or neutral zone. This adheres to the game rule that units fleeing combat cannot move to enemy-owned zones.

    *   **Priority 2: Direct Attack on Enemy HQ:** If the enemy HQ is adjacent to our current zone and we have enough PODs to capture it (enemy pods + 1 to account for fight losses and claim the zone), we send all available PODs from that zone to the enemy HQ. This is the highest offensive priority.

    *   **Priority 3: Capture Visible Neutral Platinum Zones:** If there are adjacent neutral zones with visible platinum, we send a single POD to capture the one with the highest platinum income. Capturing these zones increases our platinum income, allowing us to buy more PODs automatically.

    *   **Priority 4: Strategic Movement towards Enemy HQ / General Expansion:**
        *   If the zone still has available PODs after the above priorities, and the enemy HQ is reachable, we try to move PODs towards it along the shortest path. We identify an adjacent zone that is closer to the enemy HQ.
        *   When moving towards the HQ, we ensure we leave a minimum number of PODs for defense: 5 PODs on our main HQ, and 1 POD on other owned zones to maintain control. All remaining PODs are sent.
        *   If the target is an enemy zone on the path, we only send PODs if we have enough to capture it (`enemyPods + 1`).
        *   If no strategic path towards the HQ is found (e.g., HQ is unreachable or no closer adjacent zones), and the current zone is not in combat, we try to expand by sending a single POD to any adjacent neutral zone.

5.  **POD Commitment Tracking:**
    *   A `podsCommitted` map tracks how many PODs have already been assigned a movement command from a specific zone in the current turn. This prevents over-committing PODs and ensures we don't try to move more PODs than are truly available.

6.  **Output Format:**
    *   All calculated movements are collected and printed as a single line of commands (e.g., `5 0 1 2 1 3`). If no moves are made, `WAIT` is printed.
    *   Crucially, `WAIT` is *always* printed on the second line as per the updated rule for the buying phase.

**Considerations and Limitations:**

*   **Fight Simulation:** The logic assumes a simplified fight outcome: `enemyPods + 1` pods are needed to capture an enemy zone. This is a heuristic that works well enough without full turn-by-turn combat simulation.
*   **Fog of War:** Our `knownPlatinum` field handles the fog by remembering platinum values.
*   **Resource Management:** Platinum income is automatically converted to PODs on our base, so we don't need to issue buy commands. This simplifies resource management.
*   **Defense in Depth:** The strategy includes leaving a minimal number of PODs on owned zones, especially the HQ, for basic defense.
*   **No Complex Retreat Tactics:** The retreat logic is basic (move all to first safe neighbor). More advanced strategies might involve prioritizing specific retreat targets or splitting forces.

This strategy provides a robust and reasonably effective approach to the puzzle, balancing offensive pressure with resource management and territorial control.