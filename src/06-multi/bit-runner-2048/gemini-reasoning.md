The "Bit Runner 2048" puzzle requires controlling two cars to collect "prisoners" and deposit them into a central "manhole" to score points. The goal is to outscore the opponent within 250 turns or be the first to reach 10 points.

### Game Mechanics Overview:

*   **Map:** A circular arena with a central manhole.
*   **Cars:** Each player has two cars. Cars can pick up prisoners by getting close enough (distance between centers <= Car radius - 1). They are subject to friction and bounce off the arena walls. Movement involves providing a target `(X, Y)` and `thrust` (0-200). The car rotates up to 18 degrees towards the target and applies thrust.
*   **Prisoners:** Discs that move without friction. Initially, there are two. When a prisoner is scored in the manhole (car with prisoner enters manhole: distance between car center and manhole center <= Manhole radius - 1), a new one appears on the edge of the map, 4000 units from the center.
*   **Collisions:** Occur between cars, cars and the fence, and prisoners and the fence. Car-Car collisions with sufficient impulse (`minSwapImpulse`) can transfer prisoner control.

### Strategy: "Greedy Scorer"

The primary objective is to score points quickly. A simple yet effective strategy for the lower leagues (like Wood League) is to focus on directly acquiring and scoring prisoners.

1.  **Car Prioritization:** Each of our two cars will independently decide its action based on its current state and the available prisoners. To avoid both cars targeting the exact same unheld prisoner and potentially colliding inefficiently, we prioritize the cars (e.g., by ID) and assign targets sequentially. We also ensure a prisoner is only targeted by one of our cars per turn.

2.  **Action Logic for Each Car:**
    *   **If the car is holding a prisoner:** Its immediate goal is to score. It will drive directly towards the center of the manhole (coordinates `0, 0`) with maximum thrust.
    *   **If the car is not holding a prisoner:** It needs to find an available prisoner. It will search for the closest prisoner that is currently *not* being held by any car (neither ours nor the opponent's) and has not already been targeted by our other car in the current turn. Once identified, it will drive directly towards this prisoner's location with maximum thrust.
    *   **Fallback (No Unheld Prisoners):** If, for some reason, no unheld and untargeted prisoners are found (e.g., both prisoners are held by the opponent, or our other car is already chasing the only available one, and this car needs something to do), the car will simply drive towards the center (`0, 0`). This keeps it central, ready for a new prisoner spawn, or potentially in a position to intercept an opponent.

3.  **Thrust:** Always use maximum thrust (200). Speed is crucial for quickly grabbing prisoners and returning to the manhole. While this might lead to overshooting or bouncing off walls/manhole, it generally leads to faster point acquisition in simple scenarios.

### Implementation Details:

*   **Input Parsing:** Use `readline()` to get game data and `parseInt()` to convert strings to numbers.
*   **Entity Representation:** Create simple classes (`Entity`, `Car`, `Prisoner`) to store the properties of each game object for easier access and type safety.
*   **Distance Calculation:** A helper function `distance(p1, p2)` is essential for finding the closest prisoner or for checking proximity to the manhole.
*   **Output:** For each of our cars, print its chosen `targetX`, `targetY`, and `thrust` on a new line.

This strategy is straightforward and efficient enough to be competitive in the introductory leagues. More advanced strategies might involve predicting opponent movements, anticipating collisions for steals, or sophisticated pathfinding, but these are generally not required for the initial levels.