// In CodinGame environment, 'readline' is typically available globally or via require.
// For local execution, you might need 'npm install @types/node' and 'npm install readline'.
const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (rawtime: string) => {
    // Parse the input string: HH:MM:SS UTC[+/-]hh:mm
    // Example: "21:29:42 UTC+05:30"
    const HH = parseInt(rawtime.substring(0, 2), 10);      // Extracts HH (e.g., 21)
    const MM = parseInt(rawtime.substring(3, 5), 10);      // Extracts MM (e.g., 29)
    const SS = parseInt(rawtime.substring(6, 8), 10);      // Extracts SS (e.g., 42)

    const tzSign = rawtime.substring(12, 13);              // Extracts '+' or '-'
    const tzHH = parseInt(rawtime.substring(13, 15), 10);  // Extracts timezone hours (e.g., 05)
    const tzMM = parseInt(rawtime.substring(16, 18), 10);  // Extracts timezone minutes (e.g., 30)

    // Step 1: Obtain Biel (UTC+01:00) local time.

    // Calculate the total seconds from midnight for the given local time (HH:MM:SS)
    const currentTimeSeconds = HH * 3600 + MM * 60 + SS; // Example: 21:29:42 -> 77382 seconds

    // Calculate the timezone offset in seconds
    let tzOffsetSeconds = tzHH * 3600 + tzMM * 60; // Example: 05:30 -> 19800 seconds
    if (tzSign === '-') {
        tzOffsetSeconds = -tzOffsetSeconds; // Apply negative sign if applicable
    }

    // Convert the current local time to UTC time in seconds.
    // UTC time = Local time - Timezone Offset
    const utcSeconds = currentTimeSeconds - tzOffsetSeconds; // Example: 77382 - 19800 = 57582 seconds

    // Convert UTC time to Biel time (UTC+01:00) in seconds.
    // Biel time is 1 hour (3600 seconds) ahead of UTC.
    let bielSeconds = utcSeconds + 3600; // Example: 57582 + 3600 = 61182 seconds

    // Normalize Biel seconds to be within a 24-hour cycle (0 to 86399 seconds).
    // This handles cases where time adjustments cross midnight (e.g., become negative or exceed 24 hours).
    const SECONDS_IN_DAY = 24 * 3600; // 86400 seconds
    // The pattern (x % N + N) % N correctly handles negative modulo results in JavaScript,
    // ensuring the result is always in the range [0, N-1].
    bielSeconds = (bielSeconds % SECONDS_IN_DAY + SECONDS_IN_DAY) % SECONDS_IN_DAY;
    // Example: 61182 remains 61182 after normalization.
    // This corresponds to 16:59:42 Biel time.

    // Step 2: Convert the resulting Biel local time (in seconds) to beats.
    // Formula: (total_seconds_in_biel) / 86.4
    const beats = bielSeconds / 86.4; // Example: 61182 / 86.4 = 708.125

    // Step 3: Round the result to two decimal places using half-up rounding,
    // and always present the two decimal digits.
    // Half-up rounding for positive numbers to N decimal places: Math.floor(number * 10^N + 0.5) / 10^N
    // For 2 decimal places (N=2):
    const roundedBeats = Math.floor(beats * 100 + 0.5) / 100; // Example: Math.floor(708.125 * 100 + 0.5) / 100 = 708.13

    // Format the output to ensure exactly two decimal places (e.g., 12.00 instead of 12 or 12.3)
    const formattedBeats = roundedBeats.toFixed(2); // Example: "708.13"

    // Output the final result in the specified format "@B.BB"
    console.log(`@${formattedBeats}`);

    rl.close(); // Close the readline interface as we only expect one line of input
});