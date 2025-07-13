The "Night Of War" puzzle in CodinGame's Wood 4 league is a turn-based strategy game where the goal is to eliminate the opponent's soldiers or have more money (bucks) by turn 200. In this league, soldiers are at level 0, meaning any soldier can attack another if conditions are met. The map size is small (4x4).

My strategy is based on a clear hierarchy of actions for each of my soldiers:

1.  **Attack Priority:** The most direct path to victory is eliminating opponent soldiers. Therefore, the first priority is to check if any of my soldiers can attack an enemy soldier. An attack costs 35 bucks. If multiple targets are available, the closest one is preferred. Before attempting an attack, I verify that I have sufficient funds.

2.  **Block Capture (Adjacent):** If no immediate attack is possible or affordable, the next priority is to gain income by capturing blocks. Each owned block generates 2 bucks per turn. I try to move my soldier to an adjacent block that is either unowned or currently owned by the opponent. This maximizes immediate income gain. I also ensure that the target block is not already occupied by another soldier.

3.  **Strategic Movement:** If neither an attack nor an immediate adjacent block capture is possible, the soldier will attempt to move towards a more strategic location. This could be:
    *   The closest unowned or opponent-owned block on the map (not just adjacent).
    *   The location of the closest opponent soldier (to set up a future attack).
    This move is designed to position the soldier for future attacks or block captures, moving towards the "action" or un-tapped resources. The soldier will choose the valid move direction that minimizes its distance to this strategic target.

4.  **Wait:** If none of the above actions can be performed (e.g., the soldier is completely surrounded by friendly units or owned blocks, or there are no valid move targets), the soldier simply waits.

**Key Mechanics and Implementations:**

*   **Direction and Movement:** Soldiers cannot move in the opposite direction they are facing. I've implemented a `isValidMove` function that checks for adjacency, map boundaries, and the "no opposite direction" rule.
*   **Attack Logic:** Soldiers can attack targets within Manhattan distance 2, as long as the target is not "behind" the soldier relative to its facing direction. My `isValidAttack` function implements these rules.
*   **Soldier Occupancy:** When considering a move, the logic explicitly avoids moving a soldier onto a tile already occupied by another soldier (friendly or enemy).
*   **Input/Output:** Standard CodinGame input parsing (`readline()`) and output (`console.log()`) are used. Enums and constants are used for readability and to map directions to their coordinate deltas and names.

This strategy is greedy and prioritizes immediate impact (attack) and then economic gain (block capture), with fallback to strategic positioning. For a small map and limited soldier count in the Wood 4 league, this approach is robust and efficient enough to pass the tests within the time constraints.