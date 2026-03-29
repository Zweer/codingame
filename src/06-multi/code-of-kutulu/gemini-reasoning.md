The "Code of Kutulu" puzzle in CodinGame's Wood League involves navigating an explorer through a labyrinth, avoiding sanity loss and dangerous wanderers, while potentially benefiting from the "reassurance" mechanic by staying close to other explorers. The objective is to be the last explorer remaining.

## Reasoning for the Solution

The strategy for the Wood League focuses on a hierarchical set of priorities:

1.  **Evade Immediate Wanderer Threats:** This is the highest priority. If my explorer's current position will be occupied by a wanderer next turn, or if a wanderer is already on my cell (meaning I just got "spooked"), I *must* move to a safe location.
    *   **Wanderer Prediction:** To identify dangerous cells, I predict each active wanderer's next position. Wanderers move one step closer to their target (Manhattan distance). If a wanderer has an explicit target (`param2`), it moves towards that explorer. Otherwise (e.g., `param2` is -1 or refers to a dead explorer), it targets the closest living explorer. My prediction function prioritizes horizontal movement then vertical to resolve ties in reducing Manhattan distance.
    *   **Finding a Safe Move:** When an evade is necessary, I consider all immediately adjacent, non-wall cells. For each potential move, I check if that cell will be occupied by any wanderer (based on their predicted next positions). Among the safe cells, I choose the one that maximizes the minimum Manhattan distance to any currently active wanderer. This heuristic aims to move as far away from threats as possible. If no safe move is available (e.g., trapped by walls and wanderers), I resort to `WAIT`.

2.  **Seek Reassurance (if safe and needed):** If there's no immediate wanderer threat, the next priority is to minimize passive sanity loss. Explorers lose 3 sanity per turn normally, but only 1 sanity if another explorer is within 2 Manhattan cells.
    *   **Check Reassurance Status:** I determine if my explorer is currently reassured.
    *   **Move Towards Allies:** If not reassured and there are other living explorers, I try to move towards the closest one (determined by Breadth-First Search (BFS) pathfinding, which respects walls). BFS finds the shortest path and provides the next step to take. This helps prolong my sanity.

3.  **Default Action: WAIT:** If none of the above conditions are met (i.e., no immediate danger and either already reassured or no accessible allies), I simply `WAIT`.

**Core Components:**

*   **`Point` and `Entity` Interfaces:** Define basic data structures for coordinates and game entities.
*   **`manhattanDistance(p1, p2)`:** A simple utility to calculate Manhattan distance.
*   **`bfs(start, target, grid, width, height)`:** A Breadth-First Search implementation to find the shortest path between two points on the grid, avoiding walls. It returns the next step to take towards the target and the total path distance. This is crucial for guiding movement through the labyrinth.
*   **`getWandererPredictedNextPos(wandererPos, targetPos)`:** Predicts where a wanderer will move in the next turn based on its target.

**Input Processing:**

*   The initial map (width, height, grid layout) is read once. Wanderer spawn points are identified and stored.
*   Each turn, `entityCount` entities are read. My explorer is identified (it's always the first one on the first turn, then by its stored `id`). All explorers and wanderers (distinguishing between `WANDERING` and `SPAWNING` states) are stored.

This strategy balances immediate survival (avoiding wanderers) with long-term survival (managing sanity through reassurance), providing a robust solution for the Wood League.