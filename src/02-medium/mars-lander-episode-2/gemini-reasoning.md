The goal of this puzzle is to safely land the Mars Lander on a designated flat surface. This second episode introduces angle control, making the challenge significantly harder than just controlling thrust power.

**Landing Conditions:**
*   Land on flat ground.
*   Angle = 0°.
*   Vertical speed (absolute) <= 40 m/s.
*   Horizontal speed (absolute) <= 20 m/s.

**Control Limitations:**
*   Angle can change by at most 15° per turn.
*   Thrust power can change by at most 1 per turn.

**Strategy:**

The core idea is to manage the lander's horizontal position and speed, and vertical speed, by adjusting its angle and thrust power.

1.  **Identify Flat Ground:**
    First, the program reads the surface points to find the unique flat landing zone. This involves finding two consecutive points with the same Y-coordinate. We store their X-coordinates (`flatGroundStartX`, `flatGroundEndX`) and their common Y-coordinate (`flatGroundY`). The horizontal target for landing is usually the center of this flat zone (`landingTargetX`).

2.  **Angle Control (`newRotate`):**
    The angle control is crucial for horizontal movement and braking.
    *   **Prioritize Horizontal Speed:** If the lander's horizontal speed (`hSpeed`) is too high (e.g., `abs(hSpeed) > 20 m/s`), the primary goal is to brake horizontally.
        *   If moving right (`hSpeed > 0`), tilt left (positive angle, e.g., 45°) to apply thrust against the motion.
        *   If moving left (`hSpeed < 0`), tilt right (negative angle, e.g., -45°) to apply thrust against the motion.
    *   **Prioritize Horizontal Position:** If `hSpeed` is within acceptable limits (e.g., `abs(hSpeed) <= 10-20 m/s`), the focus shifts to bringing the lander over the center of the landing zone.
        *   If the lander is too far left (`X < landingTargetX - tolerance`), tilt right (negative angle, e.g., -10° to -20°) to move right.
        *   If the lander is too far right (`X > landingTargetX + tolerance`), tilt left (positive angle, e.g., 10° to 20°) to move left.
        *   If the lander is horizontally aligned, set the angle to 0°.
    *   **Final Approach Override:** When the lander is very close to the `flatGroundY` (e.g., `Y < flatGroundY + 150 m`), it is critical to be in a vertical position. Therefore, the angle is forced to 0°, regardless of horizontal speed or position. This assumes previous angle adjustments have successfully brought `hSpeed` and `X` within reasonable limits.
    *   **Apply Constraints:** The calculated `newRotate` is then clamped within the `rotate +/- 15°` per turn limit and the absolute `-90°` to `90°` range.

3.  **Power Control (`newPower`):**
    The thrust power mainly controls vertical speed, but also affects horizontal movement when the angle is non-zero. A common strategy is to use maximum power (4) most of the time for braking and general control, only reducing it when a faster descent is explicitly desired.
    *   **Critical Braking:** If the lander is falling too fast (`vSpeed < -39 m/s`) or is very close to the ground (`Y < flatGroundY + 100 m`), `newPower` is set to 4 to maximize braking.
    *   **Accelerate Descent (Fuel/Time Optimization):** If the lander is very high up (`Y > flatGroundY + 1000 m`) and `vSpeed` is not negative enough (e.g., `vSpeed > -10 m/s`), it might be beneficial to reduce power to 0 (free fall) to accelerate descent and save fuel. A similar, less aggressive reduction (e.g., `newPower = 2`) is applied at intermediate altitudes. These reductions are only considered if horizontal speed is not excessively high, as high horizontal speed necessitates max power for braking.
    *   **Going Up:** If `vSpeed` is positive (lander is moving upwards), set `newPower` to 0 to let gravity pull it down.
    *   **Default:** In all other scenarios (e.g., controlled descent where `vSpeed` is between `-10` and `-39 m/s`, or when horizontally braking with a non-zero angle), `newPower` is generally kept at 4 to ensure sufficient thrust for effective control.
    *   **Apply Constraints:** The calculated `newPower` is clamped within the `power +/- 1` per turn limit and the absolute `0` to `4` range.

These two control outputs (`newRotate`, `newPower`) are printed each turn.