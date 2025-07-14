The Vindinium puzzle requires controlling a hero to gather as much gold as possible within 150 turns. Gold is primarily acquired by owning gold mines. Mines can be neutral (guarded by goblins) or owned by other players. Heroes can also fight each other, with the victor gaining control of the opponent's mines. Health management is crucial: attacking mines costs HP, and heroes lose 1 HP per turn (thirst); taverns restore HP for gold.

The key to solving this puzzle efficiently, given the `MOVE x y` command, is to prioritize actions and let the game engine handle the pathfinding. The `MOVE x y` command instructs the hero to move towards the specified coordinates, taking the first step on the shortest path or staying put if already there.

### Strategy and Logic

The bot employs a priority-based decision-making system for each turn:

1.  **Urgent Healing (High Priority):** If the hero's health is critically low (e.g., 20 HP or less), and they have enough gold (at least 2) to buy a beer, the bot will immediately seek out the closest tavern. Being at 20 HP means one hit from a goblin or enemy hero could kill the hero.
2.  **General Healing (Medium Priority):** If the hero's health is moderately low (e.g., 50 HP or less) and they have enough gold, they will go to the closest tavern. This prevents falling into critical health, especially when engaging with mines or enemies. It also checks if the hero is already at a tavern and full HP to avoid unnecessary spending/waiting.
3.  **Capture Neutral Mines (Medium-High Priority):** If there are neutral mines available, the bot will prioritize moving towards the closest one. Neutral mines are the safest way to acquire new gold income as they only require fighting a goblin.
4.  **Capture Enemy Mines (Medium Priority):** If no neutral mines are available or healing isn't necessary, the bot will target the closest mine owned by an enemy. This is riskier as it involves fighting the mine's goblin and potentially the enemy hero, but it yields gold income and weakens an opponent.
5.  **Opportunistic Attack (Low Priority):** If the hero is adjacent to an opponent who is either very low on health (e.g., 40 HP or less) or has more mines than the current hero, the bot will attempt to move towards that opponent (which results in an attack due to adjacency at the end of the turn). This is an opportunistic move to potentially gain mines from a vulnerable or valuable target.
6.  **Fallback (Lowest Priority):** If none of the above conditions are met (e.g., hero is healthy, has mines, no easily accessible new mines, no vulnerable opponents), the bot will simply `WAIT`. This conserves HP and gold while awaiting new opportunities.

### Implementation Details

*   **Game State Representation:** The board is parsed once to identify static features like walls, taverns, and initial mine locations, as well as hero spawn points. Dynamic entities (heroes, mine ownership) are updated each turn.
*   **`Point` and `manhattanDistance`:** A simple `Point` interface `{ x: number; y: number }` is used for coordinates. Manhattan distance (`|x1-x2| + |y1-y2|`) is used to find the "closest" target on the grid, which is appropriate for movement on a grid.
*   **`findClosestTarget` Utility:** A generic helper function `findClosestTarget` is used to efficiently find the nearest objective (tavern, mine, or hero) based on Manhattan distance.
*   **`MOVE x y` Command:** The bot leverages the `MOVE x y` command by simply determining the target coordinates `(x, y)` based on the chosen priority. The game engine then handles the actual first step towards that target. This simplifies the bot's logic by eliminating the need for explicit pathfinding (like BFS) within the bot itself to determine the exact `NORTH`/`SOUTH`/`EAST`/`WEST` command.
*   **Debugging Output:** `printErr` is used for debugging messages, which are visible in the CodinGame console but not part of the standard output.

This strategy balances aggression (mines, hero attacks) with self-preservation (healing), providing a robust base for gameplay.