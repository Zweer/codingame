// declare function readline(): string; // Uncomment this line if running in a CodinGame environment outside of the IDE

function solve(): void {
    // Read input values from standard input
    const seed: number = parseInt(readline());
    const paperCount: number = parseInt(readline()); // Represents N, the total number of papers to generate
    const power: number = parseInt(readline());      // Represents 'power' for 2^power modulo

    // Constants for the Linear Congruential Generator (LCG)
    const A: number = 1664525;
    const C: number = 1013904223;
    const maxMod: number = Math.pow(2, power); // The modulo value (2^power) for the LCG

    // Frequency array to store counts of papers for each page count.
    // freq[i] will hold the number of papers that currently have 'i' pages left.
    // The maximum possible page count is maxMod - 1.
    const freq: number[] = new Array(maxMod).fill(0);

    // Generate the initial page counts for all 'paperCount' assignments using the LCG
    let currentZ: number = seed;
    for (let i = 0; i < paperCount; i++) {
        // Calculate the next Z value using the LCG formula: Z(n+1) = (A * Z(n) + C) MOD maxMod
        currentZ = (A * currentZ + C) % maxMod;
        // Increment the frequency for the calculated page count
        freq[currentZ]++;
    }

    // Array to store the number of active assignments left after each day
    const resultCounts: number[] = [];

    // Calculate the initial number of papers that have pages left (> 0).
    // Papers that started with 0 pages are considered completed and are not counted towards 'active' papers
    // as per the rule: "Ignore the ones who have 0 pages left for the next turn."
    let papersCurrentlyActive: number = 0;
    for (let i = 1; i < maxMod; i++) {
        papersCurrentlyActive += freq[i];
    }

    // Simulate the daily work until all papers are completed (papersCurrentlyActive becomes 0)
    while (papersCurrentlyActive > 0) {
        // Find the lowest positive page count (minPages) among the currently active papers
        let minPages: number = -1;
        for (let i = 1; i < maxMod; i++) { // Start searching from index 1 to find a positive minimum
            if (freq[i] > 0) {
                minPages = i;
                break;
            }
        }

        // This check acts as a safeguard. If papersCurrentlyActive is > 0 but no minPages is found,
        // it implies a logic error or that all remaining papers somehow became 0 unexpectedly.
        // In such a case, we add 0 to the results and break, assuming all assignments are finished.
        if (minPages === -1) {
            resultCounts.push(0);
            break;
        }

        // Create a new frequency array to store the state of papers for the start of the next day.
        // This array is built by applying the daily subtraction.
        const nextFreq: number[] = new Array(maxMod).fill(0);
        papersCurrentlyActive = 0; // Reset for recalculation based on 'nextFreq'

        // Process the subtraction: For each paper, reduce its page count by 'minPages'.
        // Papers with 'i' pages will become 'i - minPages' pages.
        for (let i = minPages; i < maxMod; i++) {
            if (freq[i] > 0) {
                const numberOfPapersAtThisCount = freq[i];
                const newPageCount = i - minPages; // This will always be >= 0

                // Add these papers to their new page count bucket in 'nextFreq'.
                nextFreq[newPageCount] += numberOfPapersAtThisCount;
            }
        }

        // Update the current frequency array ('freq') with the new state from 'nextFreq'.
        // Papers that became 0 (those ending up in nextFreq[0]) are effectively removed from the 'active' count.
        for (let i = 0; i < maxMod; i++) {
            freq[i] = nextFreq[i];
        }

        // Recalculate the number of papers that are still active (have > 0 pages) for the next day.
        for (let i = 1; i < maxMod; i++) {
            papersCurrentlyActive += freq[i];
        }

        // Add the count of active papers for the *next* day to the result.
        // This matches the example output format (e.g., 4 papers left after day 1's work).
        resultCounts.push(papersCurrentlyActive);
    }

    // Output the sequence of counts separated by spaces
    console.log(resultCounts.join(' '));
}

// Call the solve function to execute the puzzle logic
solve();