// Define the structure for an event
type Event = {
    x: number;
    h: number;
    type: 'start' | 'end'; // 'start' for x1, 'end' for x2
};

function solve() {
    // Read the number of buildings
    const n: number = parseInt(readline());

    // Create an array to store building data
    const buildings: { h: number; x1: number; x2: number }[] = [];
    for (let i = 0; i < n; i++) {
        const [h, x1, x2] = readline().split(' ').map(Number);
        buildings.push({ h, x1, x2 });
    }

    // Create a list of events from the buildings
    const events: Event[] = [];
    for (const building of buildings) {
        events.push({ x: building.x1, h: building.h, type: 'start' });
        events.push({ x: building.x2, h: building.h, type: 'end' });
    }

    // Sort events:
    // 1. Primarily by x-coordinate in ascending order.
    // 2. If x-coordinates are equal, process 'end' events before 'start' events.
    //    This order is crucial for correctly calculating the skyline height at a specific x-coordinate,
    //    especially when buildings end and others start at the same point.
    events.sort((a, b) => {
        if (a.x !== b.x) {
            return a.x - b.x;
        }
        // If x-coordinates are the same:
        // 'end' event ('end' is alphabetically smaller than 'start') comes before 'start' event.
        // This ensures a height drop is accounted for before a potential rise, for accurate net height.
        if (a.type === 'end' && b.type === 'start') return -1;
        if (a.type === 'start' && b.type === 'end') return 1;
        // If both events are of the same type at the same x, their relative order doesn't affect
        // the final max height calculation within this step.
        return 0;
    });

    let lines = 0;
    // activeHeights: A Map to keep track of buildings currently contributing to the skyline.
    // Key: building height, Value: count of buildings with that height currently active.
    const activeHeights = new Map<number, number>();

    // prevX: The x-coordinate of the previous distinct event.
    let prevX = 0;
    // currentSkylineHeight: The effective maximum height of the skyline in the interval [prevX, currentX).
    let currentSkylineHeight = 0;

    // Iterate through the sorted events using a pointer `i`.
    // The inner `while` loop (using `j`) groups events that occur at the same x-coordinate.
    for (let i = 0; i < events.length; i++) {
        const currentX = events[i].x;

        // Group all events that share the same currentX.
        let j = i;
        while (j < events.length && events[j].x === currentX) {
            j++;
        }
        // `eventsAtCurrentX` will contain all events from index `i` to `j-1`.
        const eventsAtCurrentX = events.slice(i, j);

        // Step 1: Account for the horizontal segment from `prevX` to `currentX`.
        // This segment's height is `currentSkylineHeight` (the height determined from the state before `currentX`).
        // A horizontal line is drawn if the segment has length.
        if (currentX > prevX) {
            lines++;
        }

        // Step 2: Process all grouped events at `currentX` to update `activeHeights`.
        // The sub-sort here is also important if the global sort doesn't perfectly handle complex same-X scenarios,
        // specifically to correctly update the maximum active height. For this problem's constraints,
        // `a.type === 'end' ? -1 : 1` is sufficient for the overall sort.
        // However, explicitly processing ends before starts here if not guaranteed by global sort helps clarity.
        // The main sort already ensures 'end' before 'start' for identical x, so this sub-sort is technically redundant but harmless.
        eventsAtCurrentX.sort((a, b) => {
            if (a.type === 'end' && b.type === 'start') return -1;
            if (a.type === 'start' && b.type === 'end') return 1;
            return 0;
        });

        for (const event of eventsAtCurrentX) {
            if (event.type === 'start') {
                activeHeights.set(event.h, (activeHeights.get(event.h) || 0) + 1);
            } else { // event.type === 'end'
                activeHeights.set(event.h, activeHeights.get(event.h)! - 1);
                // If the count for a height becomes zero, it means no building of that height is active anymore.
                // Remove it from the map to keep `activeHeights` clean and efficient for max height finding.
                if (activeHeights.get(event.h) === 0) {
                    activeHeights.delete(event.h);
                }
            }
        }

        // Step 3: Calculate the `newSkylineHeight` after processing all events at `currentX`.
        // This is the maximum height among all buildings that are currently active.
        let newSkylineHeight = 0;
        for (const [height, count] of activeHeights.entries()) {
            if (count > 0 && height > newSkylineHeight) {
                newSkylineHeight = height;
            }
        }

        // Step 4: Account for the vertical segment at `currentX`.
        // A vertical line is drawn if the effective skyline height changes at `currentX`.
        if (newSkylineHeight !== currentSkylineHeight) {
            lines++;
        }

        // Update `currentSkylineHeight` and `prevX` for the next iteration.
        currentSkylineHeight = newSkylineHeight;
        prevX = currentX;

        // Move the outer loop index `i` to the last event processed in this group.
        // The `for` loop's `i++` will then advance it to the start of the next distinct x-coordinate.
        i = j - 1; 
    }

    // Output the total number of lines needed.
    console.log(lines);
}

// readline function is provided by the CodinGame environment
declare function readline(): string;

// Call the solve function to execute the program
solve();