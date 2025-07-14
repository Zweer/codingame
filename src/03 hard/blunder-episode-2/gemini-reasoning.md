The problem asks us to find the maximum amount of money Blunder can collect by traversing rooms in a building, starting from room 0, and eventually exiting the building. The key constraints are:
1.  Blunder cannot go back, meaning he cannot visit the same room twice on a path.
2.  Each room has exactly two doors, leading to another room or an exit ('E').
3.  The goal is to maximize the total money collected on a path from room 0 to an exit.

This problem can be modeled as finding the "longest path" (in terms of sum of money) in a graph. The constraint "it is impossible for Blunder to go through the same room twice" due to the "layout of the building" strongly suggests that the relevant part of the graph for paths from room 0 to an exit is a Directed Acyclic Graph (DAG). If it were a general graph requiring finding the longest *simple* path (no repeated vertices), it would be an NP-hard problem, which is typically not given with `N` up to 10000. Therefore, we can assume the graph effectively behaves as a DAG for the purpose of finding such paths.

**Algorithm: Depth-First Search (DFS) with Memoization (Dynamic Programming)**

We can use a recursive Depth-First Search (DFS) approach combined with memoization (dynamic programming) to solve this efficiently.

1.  **Data Structure:** We represent the building as a graph. Each room is a node. We can store room information (money and exits) in a `Map` where the key is the room number and the value is an object containing its `money` and its `exits`.

    typescript
// Declare readline global function available in the CodinGame environment.
declare function readline(): string;

/**
 * Represents a room in the building.
 */
interface Room {
    money: number;
    exits: (number | 'E')[]; // Exits can be another room number (integer) or 'E' (string) for outside.
}

// Global maps to store room data and memoized results.
const rooms: Map<number, Room> = new Map();
const memo: Map<number, number> = new Map(); // Stores max money from a room to an exit, including current room's money.

/**
 * Main function to solve the Blunder puzzle.
 * Reads input, builds the graph, and computes the maximum money.
 */
function solve(): void {
    // Read the total number of rooms in the building.
    const N: number = parseInt(readline());

    // Parse N lines of room data.
    for (let i = 0; i < N; i++) {
        const line = readline().split(' ');
        const roomNum = parseInt(line[0]);
        const money = parseInt(line[1]);
        // Determine if exits are room numbers or 'E'.
        const exit1: number | 'E' = line[2] === 'E' ? 'E' : parseInt(line[2]);
        const exit2: number | 'E' = line[3] === 'E' ? 'E' : parseInt(line[3]);

        // Store the room information in the 'rooms' map.
        rooms.set(roomNum, {
            money: money,
            exits: [exit1, exit2]
        });
    }

    /**
     * Recursively finds the maximum amount of money Blunder can collect starting from a given room
     * and reaching an exit. This sum includes the money found in the current room.
     *
     * This function implements a Depth-First Search (DFS) with memoization (top-down dynamic programming).
     * It relies on the problem statement implying the graph is effectively a Directed Acyclic Graph (DAG)
     * for valid paths (i.e., it's impossible to revisit a room on a path to an exit).
     *
     * @param roomNum The number of the current room from which to start calculating the maximum money.
     * @returns The maximum money collectible from this room onwards, or -Infinity if no valid path
     *          to an exit exists from this room.
     */
    function findMaxMoney(roomNum: number): number {
        // If the result for this specific room has already been computed and stored in memo,
        // return the memoized value directly to avoid redundant calculations.
        if (memo.has(roomNum)) {
            return memo.get(roomNum)!; // Use '!' as we know the key exists
        }

        // Retrieve the current room's data. If the room doesn't exist (e.g., due to an invalid exit number
        // not part of the N rooms), it signifies an invalid path.
        const currentRoom = rooms.get(roomNum);
        if (!currentRoom) {
            // Returning -Infinity effectively prunes this branch, as it cannot lead to a valid exit path.
            return -Infinity;
        }

        // Initialize 'maxMoneyFromExits' to -Infinity. This will hold the maximum money obtained
        // from any path starting from one of the current room's children (exits).
        let maxMoneyFromExits = -Infinity;

        // Explore each of the two possible exits from the current room.
        for (const exit of currentRoom.exits) {
            let moneyFromNextPath: number;
            if (exit === 'E') {
                // If an exit leads to the outside ('E'), no further money is collected from that point.
                moneyFromNextPath = 0;
            } else {
                // If an exit leads to another room, recursively call findMaxMoney for that room.
                // This call will return the maximum money collectible from that next room onwards.
                moneyFromNextPath = findMaxMoney(exit);
            }

            // Update 'maxMoneyFromExits' if the current exit path yields a greater sum.
            maxMoneyFromExits = Math.max(maxMoneyFromExits, moneyFromNextPath);
        }

        let totalMoneyForCurrentPath: number;

        // After exploring all exits, determine the total money for the path starting at 'roomNum'.
        if (maxMoneyFromExits === -Infinity) {
            // If 'maxMoneyFromExits' remains -Infinity, it means neither of the current room's
            // children (exits) led to a valid path reaching an 'E' exit. Hence, this current path
            // from 'roomNum' is a dead end.
            totalMoneyForCurrentPath = -Infinity;
        } else {
            // Otherwise, add the money available in the current room to the maximum money found
            // from its children paths.
            totalMoneyForCurrentPath = currentRoom.money + maxMoneyFromExits;
        }

        // Memoize the calculated total money for the current room before returning it.
        // This prevents re-calculating the same subproblem.
        memo.set(roomNum, totalMoneyForCurrentPath);
        return totalMoneyForCurrentPath;
    }

    // Blunder always starts in room 0. Initiate the DFS from room 0 to find the overall maximum money.
    const result = findMaxMoney(0);

    // Output the final result. The problem implies a path to an exit always exists,
    // so 'result' should not be -Infinity in valid test cases.
    console.log(result);
}

// Execute the solve function to run the program.
solve();

```