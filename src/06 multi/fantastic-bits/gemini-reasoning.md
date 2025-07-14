The "Fantastic Bits" puzzle in CodinGame's Wood 4 league requires a simple yet effective strategy. The goal is to score more points than your opponent by getting Snaffles into their goal. You control two wizards.

Here's a breakdown of the strategy implemented:

1.  **Game State Parsing:**
    *   First, the `myTeamId` is read to determine your goal's position (left or right side of the map). This defines `myGoalX`, `opponentGoalX`, and the fixed `myGoalY`/`opponentGoalY` (3750).
    *   In each turn, scores are read (though not used for actions in this simple strategy).
    *   All active entities (your wizards, opponent wizards, and Snaffles) are parsed, storing their `id`, `type`, `position (x, y)`, `velocity (vx, vy)`, and `state` (whether they are holding/grabbed a Snaffle).

2.  **Wizard Actions:**
    The core logic iterates through your two wizards and determines an action for each:

    *   **If a Wizard has a Snaffle (`wizard.state === 1`):**
        *   This means the wizard grabbed the Snaffle on the *previous* turn and is now ready to throw it.
        *   **Action:** `THROW`
        *   **Target:** The wizard throws the Snaffle directly towards the center of the opponent's goal (`opponentGoalX`, `opponentGoalY`).
        *   **Power:** Maximum power (`500`) is used to ensure the Snaffle reaches the goal quickly and covers the entire map distance.

    *   **If a Wizard does NOT have a Snaffle (`wizard.state === 0`):**
        *   The wizard needs to find an ungrabbed Snaffle to go after.
        *   **Snaffle Prioritization:** The wizard searches for the closest Snaffle that is currently `ungrabbed (snaffle.state === 0)` AND has not already been targeted by the *other* friendly wizard in the current turn. This prevents both wizards from rushing the exact same Snaffle, allowing for more efficient coverage of the field.
        *   **Action:** `MOVE`
        *   **Target:** The `x, y` coordinates of the chosen closest ungrabbed Snaffle.
        *   **Thrust:** Maximum thrust (`150`) is applied to reach the Snaffle as fast as possible.
        *   **Fallback (No Ungrabbed Snaffles):** If all Snaffles are either grabbed by the opponent or already assigned to the other friendly wizard, the current wizard moves to a defensive/central position in front of its own goal. This position is calculated to be 3000 units from its goal line, vertically centered (`myGoalY`). This provides a good default waiting spot for new Snaffles or to potentially intercept incoming ones.

3.  **Collision and Physics:**
    *   The game engine handles all physics, including collisions, movement, and the precise mechanics of grabbing and throwing. The code simply outputs desired actions, and the engine simulates the outcome. This simplifies the bot logic significantly for the Wood 4 league.

This strategy ensures that your wizards are always actively pursuing Snaffles to score, and when no Snaffles are available, they move to a reasonable standby position.