/**
 * Reads a line from standard input. In CodinGame, this is provided globally.
 */
declare function readline(): string;

/**
 * Prints a message to standard output. In CodinGame, this is provided globally.
 */
declare function print(message: any): void;

// Read L, C, N from the first line of input
const line1 = readline().split(' ').map(Number);
const L = line1[0]; // L: capacity of the attraction (number of places)
const C = line1[1]; // C: total number of rides the attraction can perform per day
const N = line1[2]; // N: number of initial groups in the queue

// Read the size of each group (P_i) for N following lines
const groups: number[] = [];
for (let i = 0; i < N; i++) {
    groups.push(parseInt(readline()));
}

let totalEarnings = 0;   // Accumulates the total dirhams earned
let ridesCompleted = 0;  // Counts the number of rides completed so far
// currentHeadIndex tracks which group (by its original index in the 'groups' array)
// is currently at the front of the queue.
let currentHeadIndex = 0;

// memo is a Map used for cycle detection.
// Key: The currentHeadIndex (an integer from 0 to N-1).
// Value: An object containing { ridesTaken: number, earningsBeforeRide: number }.
// This stores the state (rides completed and earnings) *before* the ride that starts from this head index.
const memo = new Map<number, { ridesTaken: number; earningsBeforeRide: number }>();

// Main simulation loop: continues until all 'C' rides are completed
while (ridesCompleted < C) {
    // 1. Check for Cycle:
    // If the current head index has been visited before, a cycle has been detected.
    if (memo.has(currentHeadIndex)) {
        const prevState = memo.get(currentHeadIndex)!; // '!' asserts non-null as .has() returned true

        // Calculate the properties of the detected cycle
        const cycleLength = ridesCompleted - prevState.ridesTaken;
        const cycleEarnings = totalEarnings - prevState.earningsBeforeRide;

        // Calculate how many more rides are needed to reach 'C'
        const remainingRides = C - ridesCompleted;

        // If the cycle has a positive length (it should always be > 0 if a new state was found),
        // we can extrapolate the earnings and rides for multiple cycles.
        if (cycleLength > 0) {
            const numCycles = Math.floor(remainingRides / cycleLength);
            totalEarnings += numCycles * cycleEarnings;
            ridesCompleted += numCycles * cycleLength;
        }

        // After extrapolating, we break the loop because 'ridesCompleted' will now
        // be equal to or greater than 'C' (or very close, only a few remaining rides
        // might need to be simulated if 'remainingRides % cycleLength' is not 0).
        // Since we extrapolate and then break, the loop condition 'ridesCompleted < C'
        // will implicitly be false on the next check.
        break;
    }

    // 2. Store Current State:
    // If this state (currentHeadIndex) is new, store it in the memo BEFORE processing the current ride.
    // This allows us to calculate the 'delta' in rides and earnings for a full cycle when this state is revisited.
    memo.set(currentHeadIndex, { ridesTaken: ridesCompleted, earningsBeforeRide: totalEarnings });

    // 3. Simulate One Ride:
    let ridersOnThisRide = 0;  // People who get on the current ride
    let currentCapacity = L;   // Remaining capacity on the attraction for this ride
    let groupsOnRideCount = 0; // Number of groups that board this ride
    let tempHeadIndex = currentHeadIndex; // A temporary index to simulate groups boarding

    // Iterate through groups, attempting to board them until capacity is full or no more groups fit
    // The loop runs at most N times because there are only N groups in total in the queue.
    for (let i = 0; i < N; i++) {
        const groupSize = groups[tempHeadIndex];

        // If the current group fits in the remaining capacity
        if (groupSize <= currentCapacity) {
            ridersOnThisRide += groupSize;
            currentCapacity -= groupSize;
            groupsOnRideCount++;
            tempHeadIndex = (tempHeadIndex + 1) % N; // Move to the next group in the circular queue
        } else {
            // The current group doesn't fit, so the ride starts now.
            break;
        }

        // If the attraction is now full (no more space), the ride starts.
        if (currentCapacity === 0) {
            break;
        }
    }

    // Update total earnings and the count of completed rides
    totalEarnings += ridersOnThisRide;
    ridesCompleted++;

    // Update the head of the queue for the next ride.
    // This new head is the group that was next in line AFTER all groups that just boarded.
    currentHeadIndex = tempHeadIndex;
}

// Output the final calculated total earnings
print(totalEarnings);