// For CodinGame, these functions are typically provided globally
declare function readline(): string;
// declare function print(message: any): void; // console.log is usually sufficient

/**
 * Parses a chemical formula string into a map of element symbols to their total counts.
 * Handles parentheses and multipliers.
 * Example: "Al2(SO4)3" -> Map { "Al" => 2, "S" => 3, "O" => 12 }
 */
function parseFormula(formula: string): Map<string, number> {
    const totalCounts = new Map<string, number>();
    let currentCounts = new Map<string, number>();
    const stack: Array<Map<string, number>> = []; // Stack to hold counts of outer scopes

    let i = 0;
    while (i < formula.length) {
        const char = formula[i];

        if (char === '(') {
            stack.push(currentCounts); // Save the current scope's counts
            currentCounts = new Map<string, number>(); // Start a new map for the inner scope
            i++;
        } else if (char === ')') {
            i++;
            let multiplier = 1;
            // Check for a number immediately after ')'
            if (i < formula.length && /\d/.test(formula[i])) {
                let numStr = '';
                while (i < formula.length && /\d/.test(formula[i])) {
                    numStr += formula[i];
                    i++;
                }
                multiplier = parseInt(numStr);
            }

            // Apply the multiplier to the counts of the current (inner) group
            for (const [element, count] of currentCounts.entries()) {
                currentCounts.set(element, count * multiplier);
            }

            // Merge the multiplied counts with the counts from the previous (outer) scope
            if (stack.length > 0) {
                const prevCounts = stack.pop()!;
                for (const [element, count] of currentCounts.entries()) {
                    prevCounts.set(element, (prevCounts.get(element) || 0) + count);
                }
                currentCounts = prevCounts; // Continue processing with the merged map
            }
            // If stack is empty after a ')' this means it's a top-level parenthesized group
            // that has been multiplied. currentCounts now holds these final counts for that group,
            // which will be accumulated into totalCounts at the end.
        } else if (/[A-Z]/.test(char)) {
            // Element symbol (e.g., 'H', 'He', 'Al')
            let element = char;
            i++;
            while (i < formula.length && /[a-z]/.test(formula[i])) {
                element += formula[i];
                i++;
            }

            let count = 1;
            // Check for a number immediately after the element symbol
            if (i < formula.length && /\d/.test(formula[i])) {
                let numStr = '';
                while (i < formula.length && /\d/.test(formula[i])) {
                    numStr += formula[i];
                    i++;
                }
                count = parseInt(numStr);
            }

            // Add or update the count for this element in the current scope
            currentCounts.set(element, (currentCounts.get(element) || 0) + count);
        } else {
            // Should not happen for valid input, but increment to prevent infinite loop
            i++;
        }
    }

    // After parsing the entire formula, currentCounts holds the consolidated counts
    // (either from the top-level or the outermost resolved parenthesis group).
    // Merge these into the final totalCounts.
    for (const [element, count] of currentCounts.entries()) {
        totalCounts.set(element, (totalCounts.get(element) || 0) + count);
    }

    return totalCounts;
}

/**
 * Converts a map of element counts into a Hill Notation string.
 * Example: Map { "C" => 2, "H" => 6, "O" => 1 } -> "C2H6O"
 */
function toHillNotation(counts: Map<string, number>): string {
    const elements = Array.from(counts.keys());
    const hasCarbon = elements.includes('C');

    if (hasCarbon) {
        // If Carbon is present: C first, then H, then others alphabetically.
        elements.sort((a, b) => {
            // C comes before any other element
            if (a === 'C' && b !== 'C') return -1;
            if (b === 'C' && a !== 'C') return 1;
            if (a === 'C' && b === 'C') return 0; // Both are C

            // H comes after C but before other elements
            if (a === 'H' && b !== 'H') return -1;
            if (b === 'H' && a !== 'H') return 1;
            if (a === 'H' && b === 'H') return 0; // Both are H

            // Other elements are sorted alphabetically
            return a.localeCompare(b);
        });
    } else {
        // If no Carbon: all elements are sorted alphabetically.
        elements.sort((a, b) => a.localeCompare(b));
    }

    let result = '';
    for (const element of elements) {
        result += element;
        const count = counts.get(element)!;
        // Append count only if it's greater than 1
        if (count > 1) {
            result += count;
        }
    }
    return result;
}

/**
 * Parses a Hill Notation string into an array of [element, count] pairs.
 * This is used for comparison in Hill Order.
 * Example: "Al2O3" -> [["Al", 2], ["O", 3]]
 */
function parseHillNotationString(hillFormula: string): [string, number][] {
    const parts: [string, number][] = [];
    let i = 0;
    while (i < hillFormula.length) {
        let element = hillFormula[i];
        i++;
        while (i < hillFormula.length && /[a-z]/.test(hillFormula[i])) {
            element += hillFormula[i];
            i++;
        }

        let count = 1;
        if (i < hillFormula.length && /\d/.test(hillFormula[i])) {
            let numStr = '';
            while (i < hillFormula.length && /\d/.test(hillFormula[i])) {
                numStr += hillFormula[i];
                i++;
            }
            count = parseInt(numStr);
        }
        parts.push([element, count]);
    }
    return parts;
}

/**
 * Custom comparison function for sorting Hill Notation strings in Hill Order.
 * Rules:
 * 1. Compounds are sorted alphabetically by element symbol.
 * 2. If element symbols are in the same order, the one with fewer of the first differing element is sorted first.
 */
function compareHillNotation(a: string, b: string): number {
    const partsA = parseHillNotationString(a);
    const partsB = parseHillNotationString(b);

    const maxLength = Math.max(partsA.length, partsB.length);

    for (let i = 0; i < maxLength; i++) {
        // Handle cases where one formula is shorter than the other
        if (i >= partsA.length) {
            return -1; // 'a' is shorter, so it comes first
        }
        if (i >= partsB.length) {
            return 1;  // 'b' is shorter, so it comes first
        }

        const [elA, countA] = partsA[i];
        const [elB, countB] = partsB[i];

        // First, compare elements alphabetically
        const elementCompare = elA.localeCompare(elB);
        if (elementCompare !== 0) {
            return elementCompare; // Elements differ, sort by element name
        }

        // If elements are the same, compare their counts
        if (countA !== countB) {
            return countA - countB; // Elements are same, sort by count (fewer comes first)
        }
    }

    return 0; // Formulas are identical if all elements and counts match
}

// Main program execution
const N: number = parseInt(readline());

// Use a Set to automatically handle duplicate Hill Notation formulas
const hillFormulas = new Set<string>();

for (let i = 0; i < N; i++) {
    const formula: string = readline();
    const counts = parseFormula(formula);
    const hillNotation = toHillNotation(counts);
    hillFormulas.add(hillNotation);
}

// Convert the Set to an Array and sort it using the custom comparison function
const sortedFormulas = Array.from(hillFormulas).sort(compareHillNotation);

// Print each sorted formula
sortedFormulas.forEach(f => console.log(f));