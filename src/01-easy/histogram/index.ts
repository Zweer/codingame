// The 'readline()' function is provided by the CodinGame environment for reading input.
// The 'console.log()' function is used for printing output.

// Read the input string S
const S: string = readline();

// Initialize an array to store counts for each letter (A-Z)
// Index 0 corresponds to 'A', 1 to 'B', ..., 25 to 'Z'.
const counts: number[] = new Array(26).fill(0);
let totalLetters: number = 0; // Total count of all letters A-Z (case-insensitive)

// Iterate through the input string to count letter occurrences
for (let i = 0; i < S.length; i++) {
    const char = S[i];
    const charCode = char.charCodeAt(0);

    // Check if the character is an uppercase letter (A-Z)
    if (charCode >= 'A'.charCodeAt(0) && charCode <= 'Z'.charCodeAt(0)) {
        // Increment count for the corresponding uppercase letter
        counts[charCode - 'A'.charCodeAt(0)]++;
        totalLetters++;
    }
    // Check if the character is a lowercase letter (a-z)
    else if (charCode >= 'a'.charCodeAt(0) && charCode <= 'z'.charCodeAt(0)) {
        // Treat lowercase letters as their uppercase equivalent for counting
        counts[charCode - 'a'.charCodeAt(0)]++;
        totalLetters++;
    }
}

// Prepare data for histogram: percentages and bar lengths for each letter
const histogramData: { letter: string; formattedPercentage: string; barLength: number }[] = [];

for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode('A'.charCodeAt(0) + i);
    let percentageValue: number;

    // Calculate percentage.
    // The problem constraint "S contains at least one letter" ensures totalLetters will be >= 1,
    // so no division-by-zero check for totalLetters is strictly necessary.
    percentageValue = (counts[i] / totalLetters) * 100;

    // Format percentage to 2 decimal places, e.g., "36.36%"
    const formattedPercentage = percentageValue.toFixed(2) + '%';
    
    // Calculate bar length by rounding the percentage to the nearest integer.
    // As per example: 4.85 -> 5 spaces, 0.4 -> 0 spaces. Math.round() handles this.
    const barLength = Math.round(percentageValue);

    histogramData.push({
        letter: letter,
        formattedPercentage: formattedPercentage,
        barLength: barLength
    });
}

// Print the histogram based on the prepared data
for (const data of histogramData) {
    // If the bar length is 0 (meaning the rounded percentage is 0), use the compact format.
    // This covers cases like 0.00% or percentages that round down to 0 (e.g., 0.49%).
    if (data.barLength === 0) {
        // Example: B |0.00%
        console.log(`${data.letter} |${data.formattedPercentage}`);
        // Example:   +
        console.log(`  +`);
    } else { // For any non-zero bar length, draw the full bar structure.
        // Example:   +------------------------------------+
        console.log(`  +${'-'.repeat(data.barLength)}+`);
        // Example: A |                                    |36.36%
        console.log(`${data.letter} |${' '.repeat(data.barLength)}|${data.formattedPercentage}`);
        // Example:   +------------------------------------+
        console.log(`  +${'-'.repeat(data.barLength)}+`);
    }
}