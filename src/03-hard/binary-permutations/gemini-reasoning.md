The problem asks us to deduce a binary bit permutation based on several `(Xi, Yi)` input-output pairs. `N` is the number of bits. Once the permutation is found, we must apply it to `2^0, 2^1, ..., 2^(N-1)` and output the results.

Let's define the permutation. We'll use `P[input_bit_idx]` to denote the output bit position where the bit from `input_bit_idx` goes. For example, if `P[0] = 3`, it means the value of the 0th bit of the input number becomes the value of the 3rd bit of the output number. This is a mapping from input bit positions to output bit positions.

The core idea is to determine `P[input_bit_idx]` for each `input_bit_idx` from `0` to `N-1`. This is equivalent to finding the inverse mapping: for each output bit position `output_bit_idx`, which input bit position `input_bit_idx` maps to it? Let's call this `M[output_bit_idx] = input_bit_idx`. If we find `M`, then `P[input_bit_idx]` is simply `output_bit_idx` such that `M[output_bit_idx] = input_bit_idx`.

We can deduce `M` using a constraint propagation technique, similar to solving Sudoku:

1.  **Initialize Possibilities:** For each output bit position `j` (from `0` to `N-1`), maintain a set of possible input bit positions `k` that could map to it. Initially, every input bit position `k` is a possibility for every output bit position `j`. We represent these sets as bitmasks. `possible_input_pos_for_output_j[j]` will be a bitmask where the `k`-th bit is set if input `k` is a possibility for output `j`. Initially, all bits in `possible_input_pos_for_output_j[j]` are set.

2.  **Process Clues:** For each clue `(X, Y)`:
    For every output bit position `j` (from `0` to `N-1`):
    *   Get the value of the `j`-th bit in `Y` (let's call it `output_val`).
    *   Construct a temporary bitmask `valid_inputs_for_j_from_this_clue`.
    *   For every input bit position `k` (from `0` to `N-1`):
        *   Get the value of the `k`-th bit in `X` (let's call it `input_val`).
        *   If `input_val` is equal to `output_val`, then input `k` is a *possible* candidate to map to output `j` according to *this specific clue*. Add `k` to `valid_inputs_for_j_from_this_clue`.
    *   Update `possible_input_pos_for_output_j[j]` by taking its bitwise AND with `valid_inputs_for_j_from_this_clue`. This eliminates any input positions that contradict this clue.

3.  **Propagate Deductions:** After processing all clues, some `possible_input_pos_for_output_j[j]` masks might have only one bit set. This means we've uniquely determined one mapping (`M[j] = k`). We then propagate this information:
    *   Maintain an array `known_mapping_out_to_in` to store the determined mappings (initialized to -1).
    *   Maintain bitmasks `known_input_used_mask` and `known_output_used_mask` to track which input and output positions have already been uniquely mapped.
    *   Loop until no new mappings are found in an iteration:
        *   Iterate through each `j` (output position).
        *   If `M[j]` is not yet known:
            *   Consider `possible_input_pos_for_output_j[j]`, but filter out any input positions `k` that are already used (`known_input_used_mask`).
            *   If, after filtering, only *one* bit `k` remains set in the mask (meaning `k` is the only available input that could map to `j`):
                *   We've found `M[j] = k`. Record this in `known_mapping_out_to_in[j]`.
                *   Mark `k` as used in `known_input_used_mask` and `j` as used in `known_output_used_mask`.
                *   Crucially, for all other *unmapped* output positions `j_other`, remove `k` from their `possible_input_pos_for_output_j[j_other]` masks (because `k` is now taken).
                *   Set a flag to indicate progress, so the loop continues.

    Since `N` is small (up to 8), this propagation method is guaranteed to converge and find the unique permutation if sufficient clues are provided (which the problem implies).

4.  **Construct Final Permutation Map:** Create `permutation_map[input_bit_idx]` by inverting `known_mapping_out_to_in`. That is, if `known_mapping_out_to_in[j] = k`, then `permutation_map[k] = j`.

5.  **Apply Permutation:** For each `i` from `0` to `N-1`:
    *   The input is `2^i`, which is a binary number with only the `i`-th bit set to `1`.
    *   According to `permutation_map[i]`, this `1` bit at input position `i` moves to output position `permutation_map[i]`.
    *   The result is `1 << permutation_map[i]`.
    *   Store these `N` results.

6.  **Output:** Print the `N` results space-separated.

**Example Trace (N=2, C=1, X=1, Y=2):**

1.  **Initialize `possible_input_pos_for_output_j`**:
    *   `possible_input_pos_for_output_j[0]` (for output bit 0) = `(1 << 2) - 1 = 3` (binary `11`, meaning input bits 0 and 1 are possibilities).
    *   `possible_input_pos_for_output_j[1]` (for output bit 1) = `3` (binary `11`).

2.  **Process Clue (X=1 (01_2), Y=2 (10_2))**:
    *   For `j=0` (output bit 0): `output_bit_0 = (2 >> 0) & 1 = 0`.
        *   `k=0`: `input_bit_0 = (1 >> 0) & 1 = 1`. `1 != 0`, so input bit 0 is NOT valid for output bit 0.
        *   `k=1`: `input_bit_1 = (1 >> 1) & 1 = 0`. `0 == 0`, so input bit 1 IS valid for output bit 0.
        *   `valid_inputs_for_0_from_this_clue` = `(1 << 1) = 2` (binary `10`).
        *   `possible_input_pos_for_output_j[0] &= 2` => `3 & 2 = 2` (binary `11 & 10 = 10`).
    *   For `j=1` (output bit 1): `output_bit_1 = (2 >> 1) & 1 = 1`.
        *   `k=0`: `input_bit_0 = (1 >> 0) & 1 = 1`. `1 == 1`, so input bit 0 IS valid for output bit 1.
        *   `k=1`: `input_bit_1 = (1 >> 1) & 1 = 0`. `0 != 1`, so input bit 1 is NOT valid for output bit 1.
        *   `valid_inputs_for_1_from_this_clue` = `(1 << 0) = 1` (binary `01`).
        *   `possible_input_pos_for_output_j[1] &= 1` => `3 & 1 = 1` (binary `11 & 01 = 01`).

    After clue: `possible_input_pos_for_output_j` is `[2, 1]`.

3.  **Propagate Deductions**:
    *   Initialize `known_mapping_out_to_in = [-1, -1]`, `known_input_used_mask = 0`, `known_output_used_mask = 0`.
    *   **Iteration 1**: `progress_made = true`
        *   `j=0`: `possible_input_pos_for_output_j[0]` (value 2, binary `10`). `2 & ~0 = 2`. `countSetBits(2) = 1`. Unique candidate `k=1`.
            *   `known_mapping_out_to_in[0] = 1`.
            *   `known_input_used_mask |= (1 << 1) = 2`. `known_output_used_mask |= (1 << 0) = 1`.
            *   `progress_made = true`. Propagate `k=1`: `j_other=1`. `possible_input_pos_for_output_j[1] &= ~(1 << 1)` => `1 & ~2 = 1` (no change, as bit 1 wasn't set).
        *   `j=1`: `possible_input_pos_for_output_j[1]` (value 1, binary `01`). `1 & ~2 = 1`. `countSetBits(1) = 1`. Unique candidate `k=0`.
            *   `known_mapping_out_to_in[1] = 0`.
            *   `known_input_used_mask |= (1 << 0) = 1`. `known_input_used_mask` becomes `2 | 1 = 3`.
            *   `known_output_used_mask |= (1 << 1) = 2`. `known_output_used_mask` becomes `1 | 2 = 3`.
            *   `progress_made = true`. Propagate `k=0`: `j_other=0` is already mapped, skip.
    *   **Iteration 2**: `progress_made = false` (because both `j=0` and `j=1` are now mapped). Loop terminates.

    Final `known_mapping_out_to_in = [1, 0]`.

4.  **Construct `permutation_map`**:
    *   `known_mapping_out_to_in[0] = 1` => `permutation_map[1] = 0`.
    *   `known_mapping_out_to_in[1] = 0` => `permutation_map[0] = 1`.
    *   `permutation_map = [1, 0]`.

5.  **Apply Permutation**:
    *   For `i=0` (input `2^0 = 1`): `permutation_map[0] = 1`. Result: `1 << 1 = 2`.
    *   For `i=1` (input `2^1 = 2`): `permutation_map[1] = 0`. Result: `1 << 0 = 1`.

6.  **Output**: `2 1`