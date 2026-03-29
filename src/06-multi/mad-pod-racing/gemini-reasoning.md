The goal of this puzzle is to guide your pod through a series of checkpoints as quickly as possible to win the race. The challenge lies in managing your pod's inertia by applying appropriate thrust and choosing optimal target points to navigate turns efficiently.

**Core Concepts:**

1.  **Pod Movement:** You control your pod by providing a target coordinate (X, Y) and a thrust value (0-100). Pods have momentum, meaning they don't instantly stop or change direction. High thrust means higher acceleration.
2.  **Checkpoints:** Circular areas (radius 600) you must pass through in order. The game tells you the coordinates of the *next* checkpoint.
3.  **Winning:** Be the first to complete all laps.
4.  **Losing:** Time out, provide incorrect output, or fail to reach a checkpoint within 100 turns.

**Strategy:**

The strategy employed here aims to balance speed on straights with controlled braking and steering for turns.

1.  **State Management:**
    *   **Pod Position and Velocity:** The game only gives you the current position. To predict future movement and understand your pod's current heading (angle of velocity), we need to track its previous position. From this, we can infer velocity (`vx = currentX - prevX`, `vy = currentY - prevY`) and its angle of movement (`atan2(vy, vx)`).
    *   **Checkpoint Tracking:** The game reveals checkpoints one by one. To plan for future turns (e.g., how sharp the turn *after* the current checkpoint will be), we need to build a map of all checkpoints discovered so far. We store them in an array, and `currentCheckpointIdx` keeps track of which checkpoint in our array is the current target provided by the game.

2.  **Thrust Control (Braking):**
    *   **Immediate Turn Assessment:** We calculate the angle between the pod's current heading and the direction to the current target checkpoint. If this `angleMisalignment` is large (meaning a sharp turn is needed) and the pod is close to the checkpoint, we reduce thrust (brake). The closer and sharper the turn, the harder the brake.
    *   **Pre-emptive Braking for Upcoming Turns:** If we know the `nextNextCheckpoint`, we can calculate the `angleAtCheckpoint` – the sharpness of the turn at the current checkpoint itself. If this turn is sharp and we are approaching the current checkpoint, we start braking earlier to prepare for the tight corner, allowing for a smoother, faster transition.

3.  **Target Point (Steering):**
    *   **Default:** Always aim for the center of the `currentCheckPoint`.
    *   **Corner Cutting (Overshooting):** For straighter segments or moderate turns, it's more efficient to aim slightly *beyond* the center of the current checkpoint, in the direction of the `nextNextCheckpoint`. This allows the pod to "cut" the corner, maintaining speed through the turn. The `overshootAmount` is dynamically adjusted: more overshoot for straighter paths, less for moderate turns, and zero for very sharp turns where precise entry is critical.
    *   **Aiming at Center During Hard Braking:** If the pod is applying heavy brakes (low thrust), it's generally best to aim directly at the checkpoint center to ensure it enters the checkpoint precisely.

**Code Structure:**

*   `Point` class: A simple helper for 2D coordinates and distance calculation.
*   `Pod` class: Manages the pod's position, infers its velocity and heading angle.
*   `normalizeAngle` function: Ensures angles are kept within a consistent range (-PI to PI).
*   Global state variables: `checkpoints` array, `currentCheckpointIdx`, and `playerPod` instance.
*   Main game loop: Reads input, updates pod state, applies the logic for thrust and target point, and prints output.

This combined strategy provides a robust solution for navigating the track effectively, balancing speed with control to minimize lap times.