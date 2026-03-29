The problem requires us to identify speeding vehicles based on their average speed between consecutive camera readings. We are given a speed limit and a series of camera records, each containing a license plate, camera distance, and timestamp. The records are grouped by license plate, and camera distances within each group are sorted in ascending order. We need to output the license plate and the camera distance where the first speeding incident for that vehicle was detected, maintaining the order of the first appearance of license plates in the input. If no vehicles are speeding, "OK" should be printed.

Here's a breakdown of the approach:

1.  **Input Reading and Structuring:**
    *   Read the speed limit `L` and the total number of readings `N`.
    *   Store all `N` readings efficiently. A `Map` is suitable for grouping readings by `licensePlate`. The value for each `licensePlate` key will be an array of objects, each containing `distance` and `timestamp`.
    *   To fulfill the "in the same order as input" requirement for the output, we also need to keep track of the order in which unique license plates first appear in the input. An array `rawInputOrderPlates` can store unique license plates in this specific order.

2.  **Speed Calculation and Detection:**
    *   Iterate through the `rawInputOrderPlates` array. This ensures that when we process and potentially report a violation for a plate, it's done in the correct input order.
    *   For each `licensePlate`, retrieve its sorted list of camera readings from the `plateReadingsMap`.
    *   We need at least two readings to calculate a speed. If a plate has fewer than two readings, it cannot be speeding.
    *   Iterate through consecutive pairs of readings `(reading1, reading2)` for the current license plate.
    *   Calculate `distanceTraveledKm = reading2.distance - reading1.distance`.
    *   Calculate `timeTakenSeconds = reading2.timestamp - reading1.timestamp`.
    *   **Speed Calculation:**
        *   If `distanceTraveledKm` is positive and `timeTakenSeconds` is zero or negative: This implies infinite speed or time travel, which definitively means speeding. This edge case should be handled explicitly.
        *   Otherwise (if `timeTakenSeconds` is positive):
            *   Calculate `speedKmPerSecond = distanceTraveledKm / timeTakenSeconds`.
            *   Convert this to kilometers per hour: `speedKmH = speedKmPerSecond * 3600` (since there are 3600 seconds in an hour).
            *   Compare `speedKmH` with `speedLimitKmH`. If `speedKmH > speedLimitKmH`, a violation is detected.

3.  **Output Management:**
    *   Maintain a list (`results`) to store the detected violations (e.g., `"${licensePlate} ${cameraDistance}"`).
    *   Use a `Set` (`speedingPlatesAlreadyReported`) to keep track of license plates for which a violation has already been recorded in `results`. This ensures that we only report the *first* speeding instance encountered for any given vehicle (as implied by the example and common puzzle interpretations). Once a plate is added to this set, subsequent checks for that plate (if it had multiple speeding segments) will be skipped.
    *   After processing all license plates, if `results` is empty, print "OK". Otherwise, print each entry in the `results` list on a new line.

**Example Walkthrough (from problem description):**

Input:
```
50
3
RSLJ97 134 1447409503
RSLJ97 268 1447411388
RSLJ97 403 1447412242
```

1.  `speedLimitKmH = 50`
2.  `numReadings = 3`
3.  `plateReadingsMap` will store:
    `'RSLJ97': [{ distance: 134, timestamp: 1447409503 }, { distance: 268, timestamp: 1447411388 }, { distance: 403, timestamp: 1447412242 }]`
4.  `rawInputOrderPlates = ['RSLJ97']`
5.  Iterate `rawInputOrderPlates`:
    *   For `licensePlate = 'RSLJ97'`:
        *   Consider the first pair of readings:
            *   `reading1 = { d: 134, t: 1447409503 }`
            *   `reading2 = { d: 268, t: 1447411388 }`
            *   `distanceTraveledKm = 268 - 134 = 134` km
            *   `timeTakenSeconds = 1447411388 - 1447409503 = 1885` seconds
            *   `speedKmH = (134 / 1885) * 3600 = 255.915...` km/h
            *   Since `255.915... > 50` (speed limit), a violation is detected.
            *   Add `"RSLJ97 268"` to `results`.
            *   Add `'RSLJ97'` to `speedingPlatesAlreadyReported`.
            *   Break the inner loop (found the first violation for this plate).
6.  All plates processed. `results` contains `["RSLJ97 268"]`.
7.  Print `RSLJ97 268`.

This matches the example output.