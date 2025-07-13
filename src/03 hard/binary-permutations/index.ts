/**
 * Reads a line from standard input. In CodinGame, this is provided by the environment.
 * Replace with actual readline implementation if running outside CodinGame environment.
 */
declare function readline(): string;

// Helper functions for bit manipulation
function countSetBits(mask: number): number {
    let count = 0;
    while (mask > 0) {
        mask &= (mask - 1); // Brian Kernighan's algorithm
        count++;
    }
    return count;
}

function getIndexOfSetBit(mask: number): number {
    // Assumes mask has exactly one bit set (i.e., it's a power of 2)
    let index = 0;
    while (((mask >> index) & 1) === 0) {
        index++;
    }
    return index;
}

// Read N (number of bits) and C (number of clues)
const N_C = readline().split(' ').map(Number);
const N = N_C[0];
const C = N_C[1];

// Store clues (X and Y pairs)
const clues: { X: number, Y: number }[] = [];
for (let i = 0; i < C; i++) {
    const XY = readline().split(' ').map(Number);
    clues.push({ X: XY[0], Y: XY[1] });
}

// Step 1: Initialize possible_input_pos_for_output_j
// possible_input_pos_for_output_j[j] is a bitmask. The k-th bit is set
// if input bit position 'k' is a possible source for output bit position 'j'.
// Initially, any input bit can map to any output bit.
const allPossibleInputsMask = (1 << N) - 1;
const possible_input_pos_for_output_j: number[] = Array(N).fill(allPossibleInputsMask);

// Step 2: Process all clues to narrow down possibilities
for (const { X, Y } of clues) {
    for (let j = 0; j < N; j++) { // Iterate over each output bit position (0 to N-1)
        const output_bit_j = (Y >> j) & 1; // Get the value of the j-th bit in Y

        let mask_of_valid_inputs_for_j_from_this_clue = 0;
        for (let k = 0; k < N; k++) { // Iterate over each input bit position (0 to N-1)
            const input_bit_k = (X >> k) & 1; // Get the value of the k-th bit in X

            if (input_bit_k === output_bit_j) {
                // If the k-th input bit has the same value as the j-th output bit,
                // then input bit 'k' is a possible candidate to map to output bit 'j'
                // based on this specific clue (X, Y).
                mask_of_valid_inputs_for_j_from_this_clue |= (1 << k);
            }
        }
        // Intersect the current possibilities for output 'j' with the valid inputs
        // determined by this clue. This effectively removes any input bits that
        // contradict the current clue for output 'j'.
        possible_input_pos_for_output_j[j] &= mask_of_valid_inputs_for_j_from_this_clue;
    }
}

// Step 3: Deduce the permutation using propagation (naked single method)
// known_mapping_out_to_in[output_idx] = input_idx. Initialized to -1 (unknown).
const known_mapping_out_to_in: number[] = Array(N).fill(-1);
let known_input_used_mask = 0;  // Bitmask of input indices that have been definitively mapped.
let known_output_used_mask = 0; // Bitmask of output indices that have been definitively mapped.

let progress_made = true;
// Continue iterating as long as progress is being made and not all outputs are mapped.
while (progress_made && countSetBits(known_output_used_mask) < N) {
    progress_made = false; // Assume no progress is made in this iteration, reset if a mapping is found.

    // Look for "naked singles": an output position 'j' that can only be mapped from one specific input position 'k'.
    for (let j = 0; j < N; j++) {
        if (known_mapping_out_to_in[j] === -1) { // If output 'j' is not yet mapped
            let current_possibilities_for_j_mask = possible_input_pos_for_output_j[j];
            // Filter out input positions that are already used by other output positions.
            current_possibilities_for_j_mask &= ~known_input_used_mask;

            // If only one bit is set in the filtered mask, we found a unique mapping for output 'j'.
            if (countSetBits(current_possibilities_for_j_mask) === 1) {
                const k_found = getIndexOfSetBit(current_possibilities_for_j_mask); // Get the single possible input index.

                // Record the new mapping.
                known_mapping_out_to_in[j] = k_found;
                known_input_used_mask |= (1 << k_found);   // Mark input 'k_found' as used.
                known_output_used_mask |= (1 << j);        // Mark output 'j' as used.
                progress_made = true;                       // Indicate progress was made.

                // Propagate this new deduction:
                // Since 'k_found' is now used, it cannot be used by any other unmapped output position.
                for (let j_other = 0; j_other < N; j_other++) {
                    if (j_other !== j && known_mapping_out_to_in[j_other] === -1) {
                        possible_input_pos_for_output_j[j_other] &= ~(1 << k_found);
                    }
                }
            }
        }
    }
}

// Step 4: Construct the permutation_map (input_idx -> output_idx)
// This is the inverse of known_mapping_out_to_in.
// permutation_map[input_idx] will store the output_idx where input_idx's bit goes.
const permutation_map: number[] = Array(N).fill(-1);
for (let j = 0; j < N; j++) {
    const k = known_mapping_out_to_in[j];
    if (k !== -1) { // If output 'j' was mapped
        permutation_map[k] = j; // Then input 'k' maps to output 'j'.
    }
}

// Step 5: Apply the permutation to 2^0, 2^1, ..., 2^(N-1)
const results: number[] = Array(N);
for (let i = 0; i < N; i++) {
    // For an input of 2^i, only the i-th bit is set to 1.
    // This 1 bit at input position 'i' will move to output position 'permutation_map[i]'.
    // The resulting number will therefore be 2^(permutation_map[i]).
    results[i] = (1 << permutation_map[i]);
}

// Output the results space-separated.
console.log(results.join(' '));