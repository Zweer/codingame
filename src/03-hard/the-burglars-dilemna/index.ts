// For CodinGame environment, readline and print are globally available.
// declare function readline(): string;
// declare function print(s: any): void;

// Enums for clarity and type safety
enum Meaning {
    CORRECT,
    ADJACENT,
    INCORRECT,
}

// Global constants
const ALL_MEANINGS = [Meaning.CORRECT, Meaning.ADJACENT, Meaning.INCORRECT];
const ALL_SOUNDS = ["CLICK", "CLACK", "CLUCK"];
const ALL_DIGITS_SET = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

// Type definition for an attempt
interface Attempt {
    numbers: number[];
    clicks: string[];
}

/**
 * Gets the two digits adjacent to a given digit, considering 0 and 9 as adjacent.
 * For example, for 5, returns [4, 6]. For 0, returns [9, 1].
 * @param digit The digit to find adjacents for.
 * @returns An array containing the two adjacent digits.
 */
function getAdjacentDigits(digit: number): number[] {
    const result: number[] = [];
    result.push((digit - 1 + 10) % 10); // Handles 0-9 wrap-around for -1 (e.g., -1+10=9 for digit 0)
    result.push((digit + 1) % 10);      // Handles 0-9 wrap-around for +1 (e.g., 10%10=0 for digit 9)
    return result;
}

/**
 * Applies a constraint to a set of possible digits for a single position.
 * Mutates the `possibleDigitsSet` based on the given attempt digit and its derived meaning.
 * @param possibleDigitsSet The set of digits currently considered possible for a position.
 * @param attemptDigit The digit from the current attempt at this specific position.
 * @param meaning The meaning derived from the sound at this position according to the current mapping.
 * @returns True if the constraint was applied without contradiction (i.e., the set is not empty), false otherwise.
 */
function applyConstraint(
    possibleDigitsSet: Set<number>,
    attemptDigit: number,
    meaning: Meaning
): boolean {
    const digitsToKeep: Set<number> = new Set();

    if (meaning === Meaning.CORRECT) {
        // If the correct digit is not currently possible, it's a contradiction.
        if (!possibleDigitsSet.has(attemptDigit)) {
            return false;
        }
        // Only the attemptDigit is possible now.
        digitsToKeep.add(attemptDigit);
    } else if (meaning === Meaning.ADJACENT) {
        const adjacentToAttempt = new Set(getAdjacentDigits(attemptDigit));
        // Keep only digits from the current set that are adjacent to the attemptDigit.
        for (const digit of possibleDigitsSet) {
            if (adjacentToAttempt.has(digit)) {
                digitsToKeep.add(digit);
            }
        }
    } else if (meaning === Meaning.INCORRECT) {
        const adjacentToAttempt = new Set(getAdjacentDigits(attemptDigit));
        // Keep only digits from the current set that are NOT the attemptDigit AND NOT adjacent to it.
        for (const digit of possibleDigitsSet) {
            if (digit !== attemptDigit && !adjacentToAttempt.has(digit)) {
                digitsToKeep.add(digit);
            }
        }
    }

    // Update the original set
    possibleDigitsSet.clear();
    for (const digit of digitsToKeep) {
        possibleDigitsSet.add(digit);
    }

    // Return true if the set is still non-empty (no contradiction), false otherwise.
    return possibleDigitsSet.size > 0;
}

/**
 * Generates all permutations of an array.
 * This is used to create all possible mappings from sounds to meanings.
 * @param arr The array for which to generate permutations.
 * @returns A 2D array containing all permutations.
 */
function getPermutations<T>(arr: T[]): T[][] {
    if (arr.length === 0) {
        return [[]];
    }
    const firstElement = arr[0];
    const restOfArray = arr.slice(1);
    const permutationsWithoutFirst = getPermutations(restOfArray);

    const allPermutations: T[][] = [];
    permutationsWithoutFirst.forEach(perm => {
        // Insert the first element into all possible positions of each permutation of the rest
        for (let i = 0; i <= perm.length; i++) {
            const permWithFirst = [...perm.slice(0, i), firstElement, ...perm.slice(i)];
            allPermutations.push(permWithFirst);
        }
    });
    return allPermutations;
}

/**
 * Main solver function for the "Burglar's Dilemna" puzzle.
 */
function solve() {
    const N: number = parseInt(readline()); // Number of attempts
    const C: number = parseInt(readline()); // Length of the safe combination

    const attempts: Attempt[] = [];
    for (let i = 0; i < N; i++) {
        attempts.push({ numbers: readline().split(' ').map(Number), clicks: [] });
    }
    for (let i = 0; i < N; i++) {
        attempts[i].clicks = readline().split(' ');
    }

    // Generate all 6 possible mappings from ALL_SOUNDS to ALL_MEANINGS
    const soundMeaningMaps: Map<string, Meaning>[] = [];
    const meaningPermutations = getPermutations(ALL_MEANINGS);
    for (const perm of meaningPermutations) {
        const map = new Map<string, Meaning>();
        for (let i = 0; i < ALL_SOUNDS.length; i++) {
            map.set(ALL_SOUNDS[i], perm[i]);
        }
        soundMeaningMaps.push(map);
    }

    // This set will store all unique, valid safe combinations found across all mappings.
    const overallPossibleCombinations = new Set<string>();

    // Iterate through each potential sound-meaning mapping
    for (const currentMapping of soundMeaningMaps) {
        let mappingIsValid = true;
        // Deep copy the initial possible digits for each position. Each position starts with 0-9.
        const possibleDigitsPerPosition: Set<number>[] = Array.from({ length: C }, () => new Set(ALL_DIGITS_SET));

        // Apply constraints from all attempts using the current mapping
        for (let i = 0; i < N; i++) {
            const attempt = attempts[i];
            for (let j = 0; j < C; j++) {
                const attemptDigit = attempt.numbers[j];
                const sound = attempt.clicks[j];
                const meaning = currentMapping.get(sound)!; // Meaning is guaranteed to exist due to ALL_SOUNDS

                if (!applyConstraint(possibleDigitsPerPosition[j], attemptDigit, meaning)) {
                    mappingIsValid = false; // Contradiction found for this mapping
                    break; // Stop processing further digits for this attempt
                }
            }
            if (!mappingIsValid) break; // Stop processing further attempts for this mapping
        }

        // If no contradictions were found for this mapping, generate all combinations it implies.
        if (mappingIsValid) {
            const combinationsForThisMapping: string[] = [];
            
            // Recursive function to generate combinations
            const generateCombinations = (index: number, currentCombination: number[]) => {
                // Base case: if we have filled all positions
                if (index === C) {
                    combinationsForThisMapping.push(currentCombination.join(' '));
                    return;
                }

                // Recursive step: try each possible digit for the current position
                for (const digit of possibleDigitsPerPosition[index]) {
                    currentCombination.push(digit); // Add digit to current combination
                    generateCombinations(index + 1, currentCombination); // Recurse for next position
                    currentCombination.pop(); // Backtrack: remove digit for next iteration
                }
            };
            generateCombinations(0, []);

            // Filter combinations: "Each previous attempt (which is always a failed one)"
            // A generated combination is valid only if it does NOT match any of the input attempts.
            combinationsForThisMapping.forEach(comboStr => {
                const comboArr = comboStr.split(' ').map(Number);
                let matchesAnAttempt = false;
                for (const attempt of attempts) {
                    let currentAttemptMatchesCombo = true;
                    for (let j = 0; j < C; j++) {
                        if (comboArr[j] !== attempt.numbers[j]) {
                            currentAttemptMatchesCombo = false;
                            break;
                        }
                    }
                    if (currentAttemptMatchesCombo) {
                        matchesAnAttempt = true; // This generated combination is identical to an input failed attempt
                        break;
                    }
                }
                if (!matchesAnAttempt) {
                    overallPossibleCombinations.add(comboStr); // Add only if it's NOT an exact match to a failed attempt
                }
            });
        }
    }

    // Output the final result based on the number of unique possible combinations found.
    if (overallPossibleCombinations.size === 1) {
        print(overallPossibleCombinations.values().next().value);
    } else {
        print("FLEE");
    }
}

// Call the solver function to execute the program.
solve();