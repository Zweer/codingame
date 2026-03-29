// Define readline and print functions as they are provided by the CodinGame environment
declare function readline(): string;
declare function print(message: any): void;

function solve(): void {
    const speedLimitKmH: number = parseInt(readline());
    const numReadings: number = parseInt(readline());

    // Map to store readings grouped by license plate.
    // Each value is an array of objects: { distance: number, timestamp: number }
    // The readings within each array are guaranteed to be sorted by camera distance.
    const plateReadingsMap = new Map<string, Array<{ distance: number; timestamp: number }>>();

    // Array to maintain the order of first appearance of license plates in the input.
    // This is crucial for the "in the same order as input" output requirement.
    const rawInputOrderPlates: string[] = [];

    // Read all camera readings and populate the map and order array
    for (let i = 0; i < numReadings; i++) {
        const line = readline().split(' ');
        const licensePlate: string = line[0];
        const cameraDistance: number = parseInt(line[1]);
        const timestamp: number = parseInt(line[2]);

        // If this is the first time we see this license plate, add it to our order array
        // and initialize its readings array in the map.
        if (!plateReadingsMap.has(licensePlate)) {
            plateReadingsMap.set(licensePlate, []);
            rawInputOrderPlates.push(licensePlate);
        }
        // Add the current reading to the corresponding license plate's array
        plateReadingsMap.get(licensePlate)!.push({ distance: cameraDistance, timestamp: timestamp });
    }

    // Array to store the final results (license plate and detection camera distance)
    const results: string[] = [];
    // Set to keep track of license plates for which we've already reported a speeding violation.
    // This ensures we only report the first detected speeding incident per vehicle.
    const speedingPlatesAlreadyReported = new Set<string>();

    // Iterate through license plates in the order they first appeared in the input.
    for (const licensePlate of rawInputOrderPlates) {
        // If this license plate has already had a speeding violation reported, skip to the next one.
        if (speedingPlatesAlreadyReported.has(licensePlate)) {
            continue;
        }

        const readingsForPlate = plateReadingsMap.get(licensePlate)!;

        // A vehicle needs at least two camera readings to calculate a speed.
        if (readingsForPlate.length < 2) {
            continue;
        }

        // Iterate through consecutive pairs of readings for the current license plate.
        // We go up to length - 1 because we're looking at (i) and (i+1).
        for (let i = 0; i < readingsForPlate.length - 1; i++) {
            const reading1 = readingsForPlate[i];
            const reading2 = readingsForPlate[i + 1];

            const distanceTraveledKm = reading2.distance - reading1.distance;
            const timeTakenSeconds = reading2.timestamp - reading1.timestamp;

            let isSpeeding: boolean = false;

            // Edge case: If distance covered is positive but time taken is zero or negative.
            // This implies infinite speed or time travel, which is always speeding.
            // The problem states camera distances are sorted ascending, so distanceTraveledKm >= 0.
            if (distanceTraveledKm > 0 && timeTakenSeconds <= 0) {
                isSpeeding = true;
            } 
            // Normal case: Calculate speed if time taken is positive.
            else if (timeTakenSeconds > 0) {
                const speedKmPerSecond = distanceTraveledKm / timeTakenSeconds;
                const speedKmH = speedKmPerSecond * 3600; // Convert km/s to km/h

                if (speedKmH > speedLimitKmH) {
                    isSpeeding = true;
                }
            }
            // If distanceTraveledKm is 0, speed is 0 regardless of time, so not speeding.

            if (isSpeeding) {
                // Add the detected violation to the results list.
                // The detection is at the second camera in the pair (reading2.distance).
                results.push(`${licensePlate} ${reading2.distance}`);
                // Mark this license plate as reported to prevent further detections for it.
                speedingPlatesAlreadyReported.add(licensePlate);
                // Break from the inner loop and move to the next license plate.
                break; 
            }
        }
    }

    // Output the results based on whether any speeding vehicles were found.
    if (results.length === 0) {
        print("OK");
    } else {
        results.forEach(result => print(result));
    }
}

// Call the solve function to run the puzzle logic
solve();