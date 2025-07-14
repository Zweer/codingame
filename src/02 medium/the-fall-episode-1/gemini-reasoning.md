The puzzle "The Fall - Episode 1" requires predicting Indiana Jones's path through a grid of rooms. Indy moves from one room to another based on the current room's type and his entry point into that room (TOP, LEFT, or RIGHT). The problem guarantees a "safe continuous route" to the exit, meaning Indy will never encounter a dead end or an invalid path.

**Core Logic:**

1.  **Grid Representation:** The tunnel is given as a grid of room types. We need to store this grid in a 2D array (e.g., `number[][]`).
2.  **Room Movement Rules:** The most critical part is to define how Indy exits each room based on its type and his entrance point. I'll create a mapping that, for a given `roomType` and `entrancePoint` (e.g., "TOP"), provides the `exitSide` (e.g., "BOTTOM", "LEFT", "RIGHT").
    *   Since Indy cannot move upwards, "TOP" is never an `exitSide`.
    *   The "safe continuous route" constraint implies that Indy will never enter a room from a direction that leads to a "red arrow" (forbidden path) or an undefined path that would lead him stuck. Therefore, we only need to map the valid paths he *will* take.
    *   A crucial observation from the example (Type 12 room entered from RIGHT leading to BOTTOM) suggests that the images provided are not exhaustive for all valid paths; some paths are implied by the "safe route" constraint even if not explicitly drawn as green arrows.
3.  **Coordinate Transformation:** Once the `exitSide` is determined, we convert it into `(dx, dy)` offsets to calculate the next room's `(X, Y)` coordinates.
    *   "BOTTOM": `(0, 1)`
    *   "LEFT": `(-1, 0)`
    *   "RIGHT": `(1, 0)`
4.  **Game Loop:** The program enters an infinite loop:
    *   It reads Indy's current `(XI, YI)` coordinates and his `POS` (entrance point) into the current room.
    *   It retrieves the `roomType` from the pre-loaded grid at `(YI, XI)`.
    *   Using the `roomType` and `POS`, it consults the movement rules to find the `exitSide`.
    *   It calculates `(nextX, nextY)` using the current position and the `dx, dy` offsets for the `exitSide`.
    *   It prints `nextX nextY`.

**Room Type Mapping Details:**

The `ROOM_PATH_MAP` below defines the `exitSide` for each `roomType` and `entrancePoint`. This map is derived from the puzzle images and the example trace, specifically the behavior of Type 12.

*   `ROOM_EXIT_OFFSETS`: Maps exit side names ("BOTTOM", "LEFT", "RIGHT") to their respective `(dx, dy)` coordinate changes.
*   `ROOM_PATH_MAP`: Maps `roomType` to a nested object, which maps `entrancePoint` (TOP, LEFT, RIGHT) to `exitSide` (BOTTOM, LEFT, RIGHT). Entries for forbidden paths (red arrows in images) are omitted, as per the "safe continuous route" constraint, Indy will never enter from these directions.