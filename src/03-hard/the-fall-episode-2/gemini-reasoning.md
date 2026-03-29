The Fall - Episode 2 is a pathfinding puzzle where you control Indiana Jones by rotating tunnel rooms to ensure he has a safe path to the exit. This version introduces rocks and the ability to rotate rooms.

### Reasoning

1.  **Grid and Room Representation:**
    *   The tunnel is a `W x H` grid. Each cell contains a `Room`.
    *   A `Room` object will store its `initialType` (the base type from 0-13), a `boolean` indicating if it's `isRotatable`, and its current `rotation` (0 to 3, representing 0, 90, 180, 270 degrees clockwise).
    *   Rooms with a negative initial type are not rotatable.
    *   The core challenge is accurately mapping how each room type allows Indy to move through it from various entry points, considering its current rotation.

2.  **Room Connections and Rotation Logic:**
    *   I've defined an `enum Port` (TOP, RIGHT, BOTTOM, LEFT) to represent the four sides of a room.
    *   `PORT_DELTA_X` and `PORT_DELTA_Y` arrays help calculate the next cell's coordinates based on an `exitPort`.
    *   `PORT_OPPOSITE` helps determine the `entryPort` for the *next* room based on the `exitPort` from the current room.
    *   `rotatePort` and `unrotatePort` functions manage the transformation of port directions when a room is rotated.
    *   `ROOM_BASE_CONNECTIONS`: This is a crucial data structure. It's a `Record` mapping each `roomType` (0-13) to a `Map`. Each inner `Map` takes an `entryPort` and returns an array of `exitPort`s. This allows for rooms like Type 1 (cross) where multiple exit paths are possible from a single entry. This table was carefully constructed based on the puzzle images and descriptions for each room type. Specifically, I cross-referenced with similar puzzles (The Fall - Episode 1) and meticulously interpreted the images for types 2, 3, 4, 5, and 9, which can be ambiguous.

3.  **Pathfinding Algorithm (BFS):**
    *   The objective is to find *any* path to the exit. Breadth-First Search (BFS) is suitable for this.
    *   A state in the BFS queue is `[x, y, entryPort]`, representing Indy's current cell and how he entered it.
    *   `findPath(startX, startY, startEntryPort, grid, W, H, EX, rockPositions)`:
        *   It starts from Indy's current position and explores reachable cells.
        *   It marks visited states (`x,y,entryPort` combinations) to prevent cycles.
        *   **Movement Logic:** For each `(currX, currY, currEntryPort)`:
            *   Get the `currentRoom` at `(currX, currY)`.
            *   Use `currentRoom.getExitPorts(currEntryPort)` to determine possible exits. This method handles the room's base type and its current rotation.
            *   For each `exitPort`:
                *   Calculate `nextX`, `nextY`, and `nextEntryPort`.
                *   **Boundary Check:** Ensure `(nextX, nextY)` is within the grid.
                *   **Rock Check:** Ensure `(nextX, nextY)` does not contain a rock (based on `rockPositions` passed in).
                *   **Dead End Check:** Ensure the `nextRoom` at `(nextX, nextY)` allows movement *from* `nextEntryPort` (unless `nextRoom` is the exit itself). This prevents Indy from getting stuck.
                *   If all checks pass, add `[nextX, nextY, nextEntryPort]` to the queue if not already visited.
        *   The BFS returns `true` as soon as it reaches `(EX, H-1)`.

4.  **Game Turn Logic:**
    *   **Initialization:** Read grid dimensions, room types (creating `Room` objects), and the exit X coordinate.
    *   **Per Turn Loop:**
        *   Read Indy's current `(XI, YI, POSI)`.
        *   Read all rock positions into a `Set<string>` (`"x,y"` format) for efficient lookup.
        *   **Strategy:**
            1.  First, try `findPath` with the *current* grid configuration. If a path exists, output `WAIT`.
            2.  If no path is found, iterate through *every* rotatable room in the grid:
                *   **Restrictions:** Skip rooms containing Indy, the exit room, or any room containing a rock.
                *   For each valid rotatable room:
                    *   Temporarily rotate it `LEFT`.
                    *   Run `findPath`. If a path is found, output `X Y LEFT` and stop.
                    *   **Crucially:** Revert the rotation before trying the next direction/room.
                    *   Temporarily rotate it `RIGHT`.
                    *   Run `findPath`. If a path is found, output `X Y RIGHT` and stop.
                    *   **Crucially:** Revert the rotation.
        *   If no rotation leads to a path (which should theoretically not happen in solvable levels), the default `WAIT` action will be output.

5.  **Handling Rocks:**
    *   The problem states: "You do not need to anticipate the arrival of rocks in your algorithm". This means we only react to their *current* positions.
    *   The BFS `findPath` checks if Indy would move *into* a cell currently occupied by a rock.
    *   The rotation logic explicitly avoids rotating rooms that currently contain a rock.

This approach ensures a valid path is found by exploring minimal changes (one rotation) and covers all specified rules and loss conditions. The performance is adequate given the grid size constraints.