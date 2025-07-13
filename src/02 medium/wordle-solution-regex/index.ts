// Standard input reading for CodinGame TypeScript puzzles
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Global variables to store information gathered from all guesses
const yellowCharsOverall: Set<string> = new Set(); // Letters that received 'Y' result at least once
const greenCharsOverall: Set<string> = new Set(); // Letters that received 'G' result at least once
const excludedCharsOverall: Set<string> = new Set(); // Characters that were '_' at least once

// Positional information for the 5-letter word
const greenLetters: (string | null)[] = Array(5).fill(null); // Green letters at specific positions
const yellowExclusionsPerPosition: Set<string>[] = Array(5).fill(null).map(() => new Set()); // Yellow letters to exclude from specific positions

let n: number; // Number of guesses
const guessesAndResults: string[] = []; // Stores "guess result" lines

let lineCount = 0;

rl.on('line', (line: string) => {
    if (lineCount === 0) {
        n = parseInt(line);
    } else {
        guessesAndResults.push(line);
    }
    lineCount++;

    // After reading all 'n' lines of guesses and results
    if (lineCount > n) {
        rl.close(); // Close the readline interface as all input has been read
    }
});

rl.on('close', () => {
    // Process each guess and its result
    for (const line of guessesAndResults) {
        const [guess, result] = line.split(' ');

        for (let i = 0; i < 5; i++) {
            const char = guess[i];
            const res = result[i];

            if (res === 'G') {
                greenLetters[i] = char;
                greenCharsOverall.add(char);
            } else if (res === 'Y') {
                yellowCharsOverall.add(char);
                yellowExclusionsPerPosition[i].add(char);
            } else if (res === '_') {
                excludedCharsOverall.add(char);
            }
        }
    }

    // --- Construct the Regular Expression ---
    const regexParts: string[] = ['^']; // Start with the anchor

    // 1. Positive Look-aheads for 'Y' letters
    // These are for any character that received a 'Y' result at least once.
    const yLookaheadCandidates = Array.from(yellowCharsOverall).sort();
    for (const char of yLookaheadCandidates) {
        regexParts.push(`(?=.*${char})`);
    }

    // 2. Negative Look-aheads for '_' letters
    // These are for characters that received a '_' result AND never received a 'G' or 'Y' result.
    const grayLookaheadChars: string[] = [];
    for (const char of excludedCharsOverall) {
        if (!greenCharsOverall.has(char) && !yellowCharsOverall.has(char)) {
            grayLookaheadChars.push(char);
        }
    }
    grayLookaheadChars.sort(); // Ensure alphabetical order
    if (grayLookaheadChars.length > 0) {
        regexParts.push(`(?!.*[${grayLookaheadChars.join('')}])`);
    }

    // 3. Positional Pattern for the 5-letter word
    for (let i = 0; i < 5; i++) {
        if (greenLetters[i] !== null) {
            // If there's a 'G' letter at this position, use it directly
            regexParts.push(greenLetters[i] as string);
        } else {
            // Otherwise, this position is either a '.' or an immediate negative look-ahead followed by '.'
            const currentYellowExclusions = Array.from(yellowExclusionsPerPosition[i]).sort();
            if (currentYellowExclusions.length > 0) {
                // If there are 'Y' letters to exclude from this position
                const exclusionString = currentYellowExclusions.length > 1
                    ? `[${currentYellowExclusions.join('')}]` // Group multiple exclusions in brackets
                    : currentYellowExclusions[0];              // Single exclusion doesn't need brackets
                regexParts.push(`(?!${exclusionString}).`);
            } else {
                // If no specific exclusions, it's any character
                regexParts.push('.');
            }
        }
    }

    regexParts.push('$'); // End with the anchor

    console.log(regexParts.join(''));
});