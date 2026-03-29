The problem asks us to simulate a sequence of electrical appliance usage and determine if a main fuse blows. If it does, we report that. If not, we report the maximum current drawn at any point during the sequence.

Here's a breakdown of the approach:

1.  **Input Parsing:**
    *   Read the first line to get `n` (number of devices), `m` (number of clicks), and `c` (fuse capacity).
    *   Read the second line to get the current consumption for each of the `n` devices. We can store this in an array, where `deviceConsumptions[i]` corresponds to the consumption of device `i+1`.
    *   Read the third line to get the sequence of device IDs that are clicked. We'll iterate through this sequence.

2.  **State Management:**
    *   `deviceStatus`: A boolean array of size `n`. `deviceStatus[i]` will be `true` if device `i+1` is currently ON, and `false` if it's OFF. All devices start OFF.
    *   `currentTotalConsumption`: A number representing the sum of current consumed by all currently ON devices. Initialized to 0.
    *   `maximalConsumption`: A number to store the highest `currentTotalConsumption` observed throughout the operation. Initialized to 0.
    *   `fuseBlown`: A boolean flag, initialized to `false`. It will be set to `true` if the `currentTotalConsumption` ever exceeds `c`.

3.  **Simulation Loop:**
    *   Iterate `m` times, processing one click at a time from the `clickSequence`.
    *   For each `deviceId` in the sequence:
        *   Convert the `deviceId` (1-indexed) to a 0-indexed array index (`deviceIndex = deviceId - 1`).
        *   Check `deviceStatus[deviceIndex]`:
            *   If `true` (device is ON): Toggle it OFF. Subtract its consumption (`deviceConsumptions[deviceIndex]`) from `currentTotalConsumption`.
            *   If `false` (device is OFF): Toggle it ON. Add its consumption (`deviceConsumptions[deviceIndex]`) to `currentTotalConsumption`.
        *   **After updating `currentTotalConsumption`**:
            *   Check if `currentTotalConsumption > c`. If this condition is met, set `fuseBlown` to `true` and immediately break out of the loop, as the fuse has already blown and no further operations matter.
            *   If the fuse hasn't blown yet, update `maximalConsumption = Math.max(maximalConsumption, currentTotalConsumption)` to keep track of the peak current drawn.

4.  **Output:**
    *   After the loop finishes:
        *   If `fuseBlown` is `true`, print "Fuse was blown."
        *   Else (if `fuseBlown` is `false`), print "Fuse was not blown." on the first line, and "Maximal consumed current was ? A." (replacing `?` with `maximalConsumption`) on the second line.

**Constraints Check:**
*   `n` and `m` are below 100 (meaning at most 99). This ensures the arrays are small and the loop runs very few times, making the solution very efficient (O(n + m) time complexity).
*   `c` is below 10000. Maximum possible current draw is `99 * (max_device_consumption)`, which would fit comfortably within standard number types.

**TypeScript Code:**