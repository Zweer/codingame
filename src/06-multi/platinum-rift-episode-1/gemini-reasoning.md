The problem "Platinum Rift - Episode 1" challenges us to develop an AI to conquer hexagonal zones on a map, mine Platinum, and produce War PODs to expand our territory. The goal is to own the most zones after 200 rounds.

### Game Mechanics Overview

*   **Zones and Links:** The map consists of hexagonal zones connected by links.
*   **Platinum:** Zones can have Platinum sources (1-6 bars/round). Owning a zone with Platinum grants that income. Platinum is used to buy PODs (20 bars per POD).
*   **PODs:** Our units. They can move between adjacent zones, attack enemy PODs, or claim neutral zones.
*   **Game Round Steps:**
    1.  **Distributing:** Gain Platinum from owned zones.
    2.  **Moving:** Move PODs. One move per POD/group per round.
        *   PODs in a fight cannot retreat to enemy zones.
    3.  **Buying:** Purchase new PODs and place them on owned or neutral zones.
    4.  **Fighting:** If multiple players' PODs are on a zone, each player loses up to 3 PODs per round.
    5.  **Owning:** A zone with only one player's PODs becomes owned by that player. Contested or empty zones don't change ownership.

### AI Strategy

The core strategy revolves around aggressive expansion, defending valuable assets, and targeting weak enemy points.

1.  **Initialization:**
    *   Read the map structure: `zoneCount`, `linkCount`, `platinumSource` for each zone, and zone connections. Store this information in global data structures (e.g., `zones` array and `adj` adjacency list).

2.  **Per Round Logic (Main Loop):**

    *   **Input Reading:** Update the current state of all zones: `ownerId` and `pods` counts for each player.
    *   **PODs Management:** Keep track of available PODs on each of our zones using a `podsAvailableForMove` map. This allows simulating moves without altering the actual game state until output.
    *   **Pathfinding (BFS):** To make informed decisions about movements, we pre-calculate shortest paths and distances from all our currently owned zones (sources) to all other zones (targets). A multi-source Breadth-First Search (BFS) `getReachableZonesInfo` is used for this. A single-source BFS `BFS_single_source` is used for consolidation.

    *   **Move Planning (Prioritized):**
        Move commands are generated based on the following priorities:

        *   **A. Aggressive Platinum Expansion (Neutral Zones):**
            *   Identify neutral zones with `platinumSource > 0`.
            *   Sort these targets by `platinumSource` (descending) and then by distance (ascending) from our nearest owned zone.
            *   For each high-priority target, send 1 POD from the closest owned zone (which must have at least `MIN_DEFENSE_PODS` remaining after the move) towards the target along the shortest path. This initiates the claim.
            *   Mark these target zones for potential future POD purchases (`targetedZonesForNewPods`).

        *   **B. Attack Weak Enemy Zones:**
            *   Identify enemy zones.
            *   Sort these by `enemyPods` (ascending) and then by distance (ascending).
            *   For each weak enemy target, send `enemyPods + 1` PODs from the closest owned zone. This heuristic aims to overwhelm the enemy in one round of combat (assuming no other players intervene).
            *   Ensure the source zone retains `MIN_DEFENSE_PODS`.
            *   Mark these attacked zones for potential future POD purchases (`targetedZonesForNewPods`).

        *   **C. Reinforce My Zones:**
            *   Identify our owned zones that have high `platinumSource` or are border zones (adjacent to enemy/neutral territory) and have fewer than `MIN_SAFE_PODS_ON_DEFENDED_ZONE` PODs.
            *   Sort these by how many PODs they `needed` (descending).
            *   Find the closest owned zone with excess PODs (above `MIN_DEFENSE_PODS`) and send the `needed` PODs along the path.

        *   **D. Consolidate Leftover Pods:**
            *   After crucial moves, some interior zones might have excess PODs.
            *   Identify a "hub" zone (e.g., our owned zone with the highest `platinumSource`).
            *   Move excess PODs (above `EXCESS_PODS_THRESHOLD`) from other owned zones towards this hub, effectively gathering forces for future attacks or defense.

    *   **Buy Planning:**
        *   Calculate `podsToBuy` based on `myPlatinum`.
        *   Prioritize where to place new PODs:
            1.  Zones newly targeted for expansion/attack (`targetedZonesForNewPods`).
            2.  Owned zones needing reinforcement (high-platinum or border zones with low POD counts).
            3.  Any owned zone with high `platinumSource` to boost income security.
        *   Distribute `podsToBuy` as evenly as possible among these high-priority zones.

    *   **Output:** Format the `moveCommands` and `buyCommands` as required by the game (e.g., `COUNT FROM TO COUNT FROM TO` or `WAIT`).

### Data Structures

*   `Zone`: An interface to represent each hexagonal zone, storing its ID, platinum source, current owner, POD counts for all players, and a list of neighbor zone IDs.
*   `zones`: A global array of `Zone` objects, indexed by zone ID.
*   `adj`: A `Map` representing the adjacency list of the graph, mapping `zoneId` to an array of `neighborId`s.
*   `MoveCommand`, `BuyCommand`: Interfaces for storing planned actions.

### Heuristics and Constants

*   `MIN_DEFENSE_PODS = 1`: The minimum number of PODs to keep on a source zone when moving others.
*   `MIN_SAFE_PODS_ON_DEFENDED_ZONE = 5`: The target POD count for valuable owned zones (platinum or border).
*   `EXCESS_PODS_THRESHOLD = 5`: The threshold above which PODs are considered 'excess' for consolidation.
*   `POD_COST = 20`: Cost of one POD.

### Limitations and Potential Improvements

*   **Simple Attack Logic:** The `enemyPods + 1` heuristic for attacks is basic. It doesn't account for the "max 3 PODs lost per round" rule, nor does it consider multi-player fights or the enemy's potential reinforcements. A more advanced AI would simulate battles or use a more complex force calculation.
*   **No Fleeing:** The AI does not implement the "fleeing" rule to retreat PODs from losing battles.
*   **Greedy Approach:** The strategy is generally greedy and short-sighted. It prioritizes immediate gains (platinum, weak enemies) over long-term strategic goals like controlling choke points or isolating opponents.
*   **No Opponent Modeling:** The AI doesn't try to predict opponent moves or react to specific opponent strategies.
*   **No Game End Condition Logic:** The AI does not explicitly change its strategy as the game approaches round 200 (e.g., focusing solely on zone count regardless of platinum).

Despite these limitations, this strategy provides a solid foundation for Episode 1, focusing on efficient resource management and opportunistic expansion.