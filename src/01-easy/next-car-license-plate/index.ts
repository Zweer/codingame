// Define helper functions for letter-to-number and number-to-letter conversions
function lettersToNumber(s: string): number {
    // Converts a two-character string (e.g., "AA", "BZ") into a 0-indexed number (0-675).
    // 'A' is 0, 'B' is 1, ..., 'Z' is 25.
    // E.g., "AB" = 0*26 + 1 = 1. "BA" = 1*26 + 0 = 26.
    const char1 = s.charCodeAt(0) - 'A'.charCodeAt(0);
    const char2 = s.charCodeAt(1) - 'A'.charCodeAt(0);
    return char1 * 26 + char2;
}

function numberToLetters(n: number): string {
    // Converts a 0-indexed number (0-675) back into a two-character string.
    // E.g., 0 -> "AA", 26 -> "BA".
    const char1_val = Math.floor(n / 26);
    const char2_val = n % 26;
    const char1 = String.fromCharCode('A'.charCodeAt(0) + char1_val);
    const char2 = String.fromCharCode('A'.charCodeAt(0) + char2_val);
    return char1 + char2;
}

// In a CodinGame environment, input is typically read using `readline()`.
// Declare `readline` function to satisfy TypeScript compiler.
declare function readline(): string;

// Read input values
const x: string = readline(); // The starting license plate string
const n: number = parseInt(readline(), 10); // The number of subsequent registered cars

// Constants defining the range of each part of the license plate
const CDE_RANGE = 999; // The numeric part (001 to 999) has 999 distinct values.
const LETTER_RANGE = 676; // A two-letter part (AA to ZZ) has 26 * 26 = 676 distinct values.

// Calculate the total number of unique license plates in the system
const TOTAL_PLATES = LETTER_RANGE * CDE_RANGE * LETTER_RANGE;

// 1. Parse the input license plate into its three components
const parts = x.split('-');
const initial_ab_str = parts[0]; // Left letter part (e.g., "AB")
const initial_cde_val = parseInt(parts[1], 10); // Numeric part (e.g., 123)
const initial_fg_str = parts[2]; // Right letter part (e.g., "CD")

// 2. Convert each component into its 0-indexed numerical value
// For the numeric part, 001 maps to 0, 002 to 1, ..., 999 to 998.
const num_ab = lettersToNumber(initial_ab_str);
const num_cde_0_indexed = initial_cde_val - 1;
const num_fg = lettersToNumber(initial_fg_str);

// 3. Calculate the current license plate's total 0-indexed value within the entire sequence.
// The order of significance is AB (most) -> FG (medium) -> CDE (least).
// This is effectively converting a mixed-radix number to a base-10 number.
const current_total_value = num_ab * (LETTER_RANGE * CDE_RANGE) + 
                            num_fg * CDE_RANGE + 
                            num_cde_0_indexed;

// 4. Add 'n' to the current total value to find the target license plate's value.
// Use the modulo operator with TOTAL_PLATES to handle wrap-around behavior
// (e.g., if we go past ZZ-999-ZZ, it wraps back to AA-001-AA).
const final_total_value = (current_total_value + n) % TOTAL_PLATES;

// 5. Convert the final total value back into license plate components (decoding).
// This is the reverse process of encoding, using division and modulo operations.
let remaining_value = final_total_value;

// Calculate the CDE part (least significant, base CDE_RANGE)
const final_cde_0_indexed = remaining_value % CDE_RANGE;
const final_cde = final_cde_0_indexed + 1; // Convert back to 1-indexed (001-999)
remaining_value = Math.floor(remaining_value / CDE_RANGE);

// Calculate the FG part (medium significance, base LETTER_RANGE)
const final_fg_num = remaining_value % LETTER_RANGE;
const final_fg_str = numberToLetters(final_fg_num);
remaining_value = Math.floor(remaining_value / LETTER_RANGE);

// Calculate the AB part (most significance, base LETTER_RANGE)
const final_ab_num = remaining_value % LETTER_RANGE; // At this point, remaining_value is already the numerical value of AB.
const final_ab_str = numberToLetters(final_ab_num);

// 6. Format the numeric part (CDE) to ensure it's always three digits with leading zeros (e.g., 1 -> "001").
const final_cde_padded = String(final_cde).padStart(3, '0');

// 7. Construct the final license plate string in the required format.
const result_plate = `${final_ab_str}-${final_cde_padded}-${final_fg_str}`;

// 8. Output the result to standard output.
console.log(result_plate);