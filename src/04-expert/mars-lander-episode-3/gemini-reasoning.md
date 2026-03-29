The "Mars Lander - Episode 3" puzzle requires guiding a landing ship onto a flat surface with specific speed and angle constraints. The challenge in this episode is the complex, irregular terrain that requires careful navigation to avoid crashing into mountains before reaching the landing zone.

My strategy involves a multi-phase control system, prioritizing safety and achieving the landing conditions.

1.  **Terrain Analysis:**
    *   First, the program reads all terrain points to build a `surface` array.
    *   It then identifies the unique flat landing zone, storing its `startX`, `endX`, and `landY`. The `targetX` for landing is chosen as the midpoint of this flat zone.
    *   A helper function `getGroundY(landerX, surfacePoints)` is implemented to dynamically determine the ground altitude directly beneath the lander at its current X-coordinate. This is crucial for avoiding collisions with mountains.

2.  **Control Phases and Priorities:**
    The core of the logic resides in the main game loop, which determines the `desiredRotate` angle and `desiredPower` for each turn. The decision-making is structured with a priority system based on the lander's current state (altitude, speed, position relative to the landing zone and terrain).

    *   **Emergency Brake (Highest Priority):**
        *   If the lander is very close to the `currentGroundY` (e.g., `distToCurrentGround < 150m`) and falling rapidly (`vSpeed < -20 m/s`), it immediately straightens the ship (`rotate = 0`) and applies maximum thrust (`power = 4`). This is a critical safety measure to prevent crashing into any part of the terrain, not just the landing zone.

    *   **High Altitude Horizontal Approach / Braking (High Priority):**
        *   When the lander is high above the target landing `Y` (e.g., `Y > 300m`), the primary focus shifts to getting it horizontally aligned with the flat landing zone and reducing high horizontal speeds.
        *   If `hSpeed` is very high (e.g., `> 40 m/s`), aggressive braking angles (`+/- 90°`) are applied.
        *   If the lander is outside the `minFlatZoneX` to `maxFlatZoneX` range, it calculates an angle to accelerate horizontally towards the landing zone.
        *   If `hSpeed` is moderately high, a less aggressive braking angle (`+/- 30°`) is used.
        *   During all horizontal maneuvers, `power` is set to `4` to provide maximum thrust for steering and to counteract gravity, preventing rapid descent while maneuvering.

    *   **Final Landing Approach (Medium-High Priority):**
        *   Once the lander is within the `landingAltitudeThreshold` (e.g., `Y - landY < 300m`), within the horizontal boundaries of the flat zone (`X` between `minFlatZoneX` and `maxFlatZoneX`), and `hSpeed` is already within acceptable limits (`abs(hSpeed) <= 25 m/s`), the focus becomes strictly on a soft vertical landing.
        *   The `rotate` angle is set to `0`.
        *   `power` is carefully adjusted based on `vSpeed`:
            *   `power = 4` if falling too fast (`vSpeed < -MAX_VSPEED_LANDING`).
            *   `power = 3` for an optimal controlled descent (`vSpeed` around -20 to -40 m/s).
            *   `power = 0` or `2` if falling too slowly or rising.

    *   **General Descent and Fine-Tuning (Default Phase):**
        *   If none of the above critical conditions are met, the lander is generally descending. The strategy here is to fine-tune `hSpeed` to keep it low and try to center the lander over `targetX` with small angle adjustments.
        *   If a non-zero angle is required for horizontal correction, `power` is set to `4`.
        *   If `rotate` is `0`, `power` is adjusted to manage `vSpeed` towards a controlled descent, allowing for some acceleration downwards to reach the landing zone efficiently but not too fast.

3.  **Constraints Application:**
    *   Finally, the calculated `targetRotation` and `targetPower` are clamped to respect the per-turn limits (`+/- 15°` for angle, `+/- 1` for power) and overall min/max values (`-90°` to `90°` for angle, `0` to `4` for power).

This layered approach ensures that the lander prioritizes safety by avoiding collisions, then focuses on horizontal positioning, and finally executes a precise vertical landing.