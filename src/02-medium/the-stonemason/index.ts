/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

// This function maps a Fibonacci sequence index (F_1, F_2, F_3, ...) to a unit name.
// Our Fibonacci sequence starts with F_1=1, F_2=2, F_3=3, F_4=5, F_5=8, ...
// This means F_n here corresponds to F_{n+1} in the standard Fibonacci sequence (0, 1, 1, 2, 3, 5, ...).
// Unit mapping based on problem description and derivations:
// F_1 (value 1) -> 2R (palm)
// F_2 (value 2) -> 1R (full palm)
// F_3 (value 3) -> C (span)
// F_4 (value 5) -> 1L (foot)
// F_5 (value 8) -> 2L (cubit)
// And so on for unnamed units (3L, 3R, etc.)
function getUnitName(fibIndex: number): string {
    if (fibIndex === 3) {
        return "C";
    } else if (fibIndex > 3) {
        // For L units: fibIndex 4 -> 1L, fibIndex 5 -> 2L, etc.
        // Pattern: (fibIndex - 3)L
        return `${fibIndex - 3}L`;
    } else { // fibIndex < 3 (i.e., 1 or 2, as F_0 is not used as a unit)
        // For R units: fibIndex 2 -> 1R, fibIndex 1 -> 2R.
        // Pattern: (3 - fibIndex)R
        return `${3 - fibIndex}R`;
    }
}

// Generate Fibonacci numbers.
// We use the sequence where F_1=1, F_2=2, F_3=3, F_4=5, F_5=8, ...
// The array `fibValues` stores these numbers, where `fibValues[0]` is F_1, `fibValues[1]` is F_2, etc.
const fibValues: number[] = [];
fibValues.push(1); // F_1
fibValues.push(2); // F_2

let a = 1; // Corresponds to F_1 in our sequence
let b = 2; // Corresponds to F_2 in our sequence

// Generate Fibonacci numbers up to a value larger than the maximum possible target value.
// The maximum possible input `length` in CodinGame puzzles is typically up to 2 * 10^9.
// Our 'C' unit (span) has a value of 3 (F_3, which is `fibValues[2]`).
// So, the maximum `targetValue` can be `2 * 10^9 * 3 = 6 * 10^9`.
// Fibonacci numbers grow quickly. For instance, F_49 (in our sequence) is 7,778,742,049,
// which is sufficient to cover target values up to 6 * 10^9.
// JavaScript's `number` type can safely represent integers up to 2^53 - 1 (approx 9 * 10^15),
// so `6 * 10^9` is well within the safe integer range.
while (b <= 6 * 10**9) {
    const nextFib = a + b;
    fibValues.push(nextFib);
    a = b;
    b = nextFib;
}

// The 'C' unit (span) corresponds to F_3 in our Fibonacci sequence.
// In the `fibValues` array, F_3 is at index 2 (since `fibValues[0]` is F_1).
const C_value = fibValues[2]; // This will be 3

// Read the input `length` from stdin.
// `length` is provided as a multiple of the 'span' unit.
// So, if the input `length` is `N`, the total value we need to measure is `N * (value of C)`.
const lengthInput: number = parseInt(readline());
const targetValue = lengthInput * C_value;

const resultUnits: string[] = [];
let remainingValue = targetValue;

// Apply Zeckendorf's theorem using a greedy approach.
// We iterate from the largest generated Fibonacci number downwards to find the unique
// sum of non-consecutive Fibonacci numbers that equals `targetValue`.
for (let i = fibValues.length - 1; i >= 0; i--) {
    const fibNum = fibValues[i];

    if (remainingValue >= fibNum) {
        remainingValue -= fibNum;
        // The Fibonacci index corresponding to `fibNum` (which is `fibValues[i]`) is `i + 1`.
        resultUnits.push(getUnitName(i + 1));
    }

    // Optimization: If the remaining value is 0, we have found the full representation.
    if (remainingValue === 0) {
        break;
    }
}

// The `resultUnits` array is automatically sorted by unit value (largest first)
// because the Zeckendorf greedy algorithm processes larger numbers first.
// This matches the required output format.
console.log(resultUnits.join(' '));