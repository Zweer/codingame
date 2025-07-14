// Standard input/output declarations for CodinGame environment
declare function readline(): string;
declare function print(message: any): void;

/**
 * Calculates the sum of the digits of a given number.
 * @param n The number for which to sum the digits.
 * @returns The sum of the digits.
 */
function sumDigits(n: number): number {
    let sum = 0;
    let num = n;
    while (num > 0) {
        sum += num % 10;       // Add the last digit
        num = Math.floor(num / 10); // Remove the last digit
    }
    return sum;
}

// Read the input integer r1
const r1: number = parseInt(readline());

let isMeetingPoint = false;

// If r1 is a meeting point, it implies that there exists some number X (where X < r1)
// such that X + sumDigits(X) = r1.
// In this scenario, river X (starting with X) will eventually reach r1,
// and river r1 (starting with r1) also contains r1. This fulfills the condition
// of "two or more" digital rivers meeting at r1.

// The maximum sum of digits for any number X less than 100,000 (e.g., 99999) is 9*5 = 45.
// This means if X + sumDigits(X) = r1, then X must be at least r1 - 45
// (since sumDigits(X) is at most 45 and at least 1).
// This knowledge allows us to significantly optimize the search range for X.
// We only need to check X values from `r1 - 45` up to `r1 - 1`.
// We also ensure X is never less than 1.
const lowerBound = Math.max(1, r1 - 45);

// Iterate through possible preceding numbers X
for (let x = lowerBound; x < r1; x++) {
    // Calculate what the next number would be in a river starting with x
    const nextValueInRiverX = x + sumDigits(x);

    // If this next value is exactly r1, then r1 is a meeting point.
    // It's met by river X and river r1.
    if (nextValueInRiverX === r1) {
        isMeetingPoint = true;
        break; // Found a solution, no need to check further
    }
}

// Print the final result based on whether r1 was found to be a meeting point
if (isMeetingPoint) {
    print("YES");
} else {
    print("NO");
}