The goal of this CodinGame puzzle, "Game of Drones", is to control more Krysal zones than your opponents by the end of 200 rounds. Each controlled zone grants 1 point per round. You command a team of drones, and each drone can move a maximum of 100 units per turn.

**Game Rules Summary:**
*   **Controlling a zone:** A zone is controlled if you have at least one drone within 100 units of its center. If multiple players have drones in the same zone, the one with numerical superiority (more drones inside) takes control.
*   **Retaining control:** You retain control as long as no enemy drone is inside the zone, even if your drones leave.
*   **Map:** A 4000x1800 rectangular area. (0,0) is top-left.
*   **Input:** Initial game parameters (number of players, your ID, number of drones, number of zones) and then zone coordinates. In each turn: zone controllers, then all drone positions (yours and opponents').
*   **Output:** For each of your drones, output the X Y coordinates of its target destination.

**Strategy for Wood League:**

The core challenge is deciding which zone each of your drones should go to. A simple yet effective strategy for this league involves prioritizing zones and then assigning drones to them.

1.  **Understand Zone State:**
    For each zone, we need to know:
    *   Who controls it (or if it's uncontrolled).
    *   How many of our drones are currently inside its capture radius.
    *   How many enemy drones are currently inside its capture radius.

2.  **Prioritize Zones:**
    We want to target zones that offer the most strategic advantage. A good priority order is:
    *   **Uncontrolled Zones (`controllerId === -1`):** These are the easiest to capture, as you only need one drone inside and no opponents. They offer immediate points.
    *   **My Zones Under Attack (`controllerId === MY_ID && enemyDronesInside > 0`):** These are zones we currently control, but enemies are contesting them. We must send drones to maintain numerical superiority and prevent losing points.
    *   **Enemy Zones (`controllerId !== MY_ID && controllerId !== -1`):** These are zones controlled by opponents. Capturing them requires numerical superiority and directly denies points to the enemy while gaining points for us.

3.  **Assign Drones:**
    The drone assignment needs to be somewhat intelligent to avoid all drones rushing to the same nearest target. We'll use a two-pass assignment system:

    *   **First Pass (Primary Assignment):** For each highly prioritized zone, assign *one* of your available drones to it. We pick the available drone that is closest to that specific zone. This ensures that every critical zone gets at least one drone heading towards it. After assignment, the drone is marked as "unavailable".
    *   **Second Pass (Reinforcement/Remaining Drones):** Any drones not assigned in the first pass are then assigned. These drones will go to the closest available zone that is *uncontrolled or enemy-controlled*. This reinforces areas where we might need numerical superiority or captures new objectives. If, by some rare chance, all zones are already controlled by us and no enemies are present (meaning we're probably winning), the remaining drones are sent to the closest of our own zones to "guard" them.

4.  **Movement:**
    Drones are simply directed to the center coordinates of their assigned zone. Since drones move 100 units per turn, they will approach the target over several turns if it's far away.

**Code Structure:**

The code follows the standard CodinGame structure:
*   **Type Definitions:** `Point`, `Zone`, `Drone` classes/interfaces to represent game entities.
*   **Utility Functions:** `distanceSq` for efficient distance calculations (avoiding `sqrt` unless exact distance is needed).
*   **Global Variables:** To store game parameters and state (zones, my drones, opponent drones).
*   **Initialization Phase:** Reads the initial setup data (player count, your ID, drone count, zone count and positions).
*   **Game Loop:**
    *   Reads per-turn data (zone controllers, all drone positions).
    *   Updates the `Zone` objects with current drone counts (my and enemy drones inside each zone).
    *   Executes the decision logic as described above to determine each drone's target.
    *   Prints the `X Y` coordinates for each of your drones' targets.

This strategy balances simplicity with effectiveness, providing a solid foundation for the given league constraints.