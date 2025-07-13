import * as readline from 'readline';

// Helper to count digit occurrences in a string
function getDigitCounts(s: string): Map<string, number> {
    const counts = new Map<string, number>();
    for (let i = 0; i <= 9; i++) {
        counts.set(String(i), 0);
    }
    for (const char of s) {
        counts.set(char, counts.get(char)! + 1);
    }
    return counts;
}

// Helper to build the smallest number string from a given set of digit counts for a specific length.
// It also returns the remaining digit counts after building the number.
// Returns [numberString | null, remainingCounts | null]
// `numberString` is null if the number cannot be formed according to rules (e.g., leading zero where not allowed, not enough digits, value too large).
function buildMinNumberAndRemaining(digitCounts: Map<string, number>, length: number): [string | null, Map<string, number> | null] {
    if (length === 0) {
        return ["", new Map(digitCounts)]; // Empty string represents no digits consumed
    }

    const tempCounts = new Map(digitCounts); // Work on a copy of digit counts
    const chars: string[] = [];
    let firstDigit: string | null = null;

    // Determine the first digit based on "no leading 0s" rule, unless the number is "0" itself.
    if (length === 1 && tempCounts.get('0')! > 0) {
        // Special case: single digit '0' is allowed.
        firstDigit = '0';
    } else {
        // Find smallest non-zero digit for the first position
        for (let d = 1; d <= 9; d++) {
            const charD = String(d);
            if (tempCounts.get(charD)! > 0) {
                firstDigit = charD;
                break;
            }
        }
    }

    if (firstDigit === null) {
        // Cannot form a valid first digit (e.g., trying to build a multi-digit number but only '0's are left, or no digits at all)
        return [null, null];
    }

    // Consume the first digit
    chars.push(firstDigit);
    tempCounts.set(firstDigit, tempCounts.get(firstDigit)! - 1);

    // Fill remaining digits greedily (smallest first)
    for (let d = 0; d <= 9; d++) {
        const charD = String(d);
        while (tempCounts.get(charD)! > 0 && chars.length < length) {
            chars.push(charD);
            tempCounts.set(charD, tempCounts.get(charD)! - 1);
        }
    }

    // Check if the desired length was achieved using available digits
    if (chars.length !== length) {
        return [null, null]; // Not enough digits to form the number of desired length
    }

    const numStr = chars.join('');

    // Check value constraint: 0 <= num <= 10^18. 10^18 has 19 digits.
    if (numStr.length > 19) {
        return [null, null]; // Too many digits (value definitely exceeds 10^18)
    }
    // Specific check for 19-digit numbers that exceed 10^18
    // Note: 10n**18n is BigInt for 1 followed by 18 zeros.
    if (numStr.length === 19 && BigInt(numStr) > 10n**18n) {
         return [null, null];
    }

    return [numStr, tempCounts];
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (S: string) => {
    const L = S.length;
    const initialCounts = getDigitCounts(S);

    let finalA_str: string | null = null;
    let finalB_str: string | null = null;
    // Initialize best values with something larger than max possible 10^18, to ensure first valid candidate wins.
    const MAX_BIGINT = 10n**19n; // Value larger than 10^18
    let bestValA: bigint = MAX_BIGINT;
    let bestValB: bigint = MAX_BIGINT;

    // --- Constraint & Edge Case Handling ---
    // 1. Needs at least two digits to form two numbers
    if (L < 2) {
        console.log("-1 -1");
        rl.close();
        return;
    }

    // 2. A, B <= 10^18 means max 19 digits per number. Total digits cannot exceed 19 + 19 = 38.
    if (L > 38) {
        console.log("-1 -1");
        rl.close();
        return;
    }

    // 3. Special Case: All digits are '0'
    let nonZeroCount = 0;
    for (let d = 1; d <= 9; d++) {
        nonZeroCount += initialCounts.get(String(d))!;
    }
    if (nonZeroCount === 0) { // All digits are '0'
        if (L === 2) { // S is "00", valid to form "0 0"
            console.log("0 0");
        } else { // S is "0" (L=1, already caught), or "000", "0000" etc. (impossible to use all '0's for two valid numbers)
            console.log("-1 -1");
        }
        rl.close();
        return;
    }

    // --- Main Logic: Iterate through all possible lengths for number A ---
    // A must have at least 1 digit, B must have at least 1 digit.
    for (let lenA = 1; lenA < L; lenA++) {
        const lenB = L - lenA;

        // Attempt to form number A first, then B from remaining digits.
        const [candidateA_str, remainingCountsForB] = buildMinNumberAndRemaining(initialCounts, lenA);

        if (candidateA_str !== null && remainingCountsForB !== null) {
            const [candidateB_str, finalRemainingCounts] = buildMinNumberAndRemaining(remainingCountsForB, lenB);

            if (candidateB_str !== null && finalRemainingCounts !== null) {
                // Ensure all digits from original S were used exactly once
                let allDigitsUsed = true;
                for (const count of finalRemainingCounts.values()) {
                    if (count !== 0) {
                        allDigitsUsed = false;
                        break;
                    }
                }

                if (allDigitsUsed) {
                    const currentValA = BigInt(candidateA_str);
                    const currentValB = BigInt(candidateB_str);

                    // Compare with the best found so far: minimize A, then minimize B
                    if (currentValA < bestValA || (currentValA === bestValA && currentValB < bestValB)) {
                        bestValA = currentValA;
                        bestValB = currentValB;
                        finalA_str = candidateA_str;
                        finalB_str = candidateB_str;
                    }
                }
            }
        }
    }

    if (finalA_str !== null && finalB_str !== null) {
        console.log(`${finalA_str} ${finalB_str}`);
    } else {
        console.log("-1 -1"); // No valid pair found after all attempts
    }

    rl.close();
});