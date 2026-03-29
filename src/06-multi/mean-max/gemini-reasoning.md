This puzzle, "Mean Max", is a league-based game. For the Wood 4 league, the simplest version, the core objective is to collect water from Wrecks using your Reaper. The game involves three players, and the goal is to have more water than your opponents by the end of 200 turns or when any player reaches 50 water.

### Reasoning

1.  **Game State Parsing**: The first step in any CodinGame puzzle is to correctly parse the input. We need to read player scores, then skip some placeholder lines, and finally parse the details of all units (Reapers and Wrecks) on the map.
    *   Units have properties like `id`, `type`, `playerId`, `mass`, `radius`, `position (x, y)`, `velocity (vx, vy)`, and `extra` (which represents water for Wrecks).
    *   My Reaper has `playerId = 0` and `type = 0`. Wrecks have `type = 4` and `playerId = -1`.

2.  **Identifying Key Entities**: From the parsed units, we need to:
    *   Find our own Reaper (unit with `type: 0` and `playerId: 0`).
    *   Identify all available Wrecks (units with `type: 4` and `extra > 0`, meaning they still contain water).

3.  **Core Strategy - Greedy Approach**: For Wood 4, a simple and effective strategy is a "greedy" one:
    *   **Find the Closest Wreck**: Calculate the Euclidean distance from our Reaper's current position to the center of every available Wreck.
    *   **Prioritize the Nearest**: Select the Wreck that is closest to our Reaper. This minimizes travel time to a water source.
    *   **Max Throttle**: Once a target Wreck is identified, command the Reaper to move towards its coordinates (`X Y`) using the maximum available `THROTTLE` (300). This ensures the Reaper reaches the target as quickly as possible. The Reaper's high acceleration (`THROTTLE / mass`, where mass is 0.5) allows for quick course changes.

4.  **Handling No Targets**: If, for some reason, no Wrecks with water are found (e.g., all collected, though unlikely in a typical game flow), the Reaper should perform a `WAIT` action as a safe fallback.

5.  **Output Format**: The game requires our Reaper's action on the first line, followed by two `WAIT` commands (placeholders for other units in higher leagues).

This strategy focuses purely on efficient water collection, which is the primary objective in this initial league. More complex strategies involving predicting opponent moves, collision physics, or optimizing paths through multiple wrecks are not necessary for Wood 4.

### Code