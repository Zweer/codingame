// Helper function to clean text (uppercase, no spaces, J -> I)
function cleanText(text: string): string {
    return text.toUpperCase().replace(/J/g, 'I').replace(/ /g, '');
}

// Global Maps/Grids for Polybius square
// Using 1-indexed coordinates for consistency with puzzle description
// polybiusGrid[row][col]
const polybiusGrid: (string | null)[][] = Array(6).fill(null).map(() => Array(6).fill(null));
// charToCoords[char] = [row, col]
const charToCoords: Map<string, [number, number]> = new Map();

/**
 * Updates the global charToCoords and polybiusGrid maps.
 * Throws an error if a contradiction is found (e.g., character already mapped to different coords).
 * Returns true if any mapping was added or changed, false otherwise.
 */
function updateMappings(char: string, r: number, c: number): boolean {
    let changed = false;

    // Validate coordinates
    if (r < 1 || r > 5 || c < 1 || c > 5) {
        throw new Error(`Invalid coordinates: (${r}, ${c}) for char ${char}`);
    }

    // Attempt to update charToCoords
    if (charToCoords.has(char)) {
        const [prevR, prevC] = charToCoords.get(char)!;
        if (prevR !== r || prevC !== c) {
            // Contradiction: character is already mapped to different coordinates
            throw new Error(`Contradiction: ${char} already mapped to (${prevR}, ${prevC}), trying to map to (${r}, ${c})`);
        }
    } else {
        charToCoords.set(char, [r, c]);
        changed = true;
    }

    // Attempt to update polybiusGrid
    if (polybiusGrid[r][c] !== null && polybiusGrid[r][c] !== char) {
        // Contradiction: grid position already contains a different character
        throw new Error(`Contradiction: (${r}, ${c}) already contains ${polybiusGrid[r][c]}, trying to put ${char}`);
    } else if (polybiusGrid[r][c] === null) {
        polybiusGrid[r][c] = char;
        changed = true;
    }
    return changed;
}

// Read input
const plainText1 = readline();
const cipherText1 = readline();
const cipherText2 = readline();

// Clean input texts
const p1Clean = cleanText(plainText1);
const c1Clean = cleanText(cipherText1);
const L = p1Clean.length; // Length of the cleaned texts

// S_digits will store the combined sequence of plaintext coordinates.
// S_digits[k] = row_k (for k < L)
// S_digits[k+L] = col_k (for k < L)
// Initialize with 0s (unknown digits). Digits are 1-5.
const S_digits: number[] = Array(2 * L).fill(0);

// --- Constraint Propagation Loop to derive the Polybius square ---
let changedInLoop = true;
while (changedInLoop) {
    changedInLoop = false;

    // Phase 1: Propagate from charToCoords to S_digits
    // If we know a char's coordinates, we can deduce corresponding S_digits values
    for (let k = 0; k < L; k++) {
        const pChar = p1Clean[k];
        const cChar = c1Clean[k];

        // S_digits indices related to P1[k]'s original coordinates
        const rP_idx = k;
        const cP_idx = k + L;
        // S_digits indices related to C1[k]'s coordinates in the combined sequence
        const rC_idx = 2 * k;
        const cC_idx = 2 * k + 1;

        // Try to fill S_digits based on known charToCoords for P1[k]
        if (charToCoords.has(pChar)) {
            const [r, c] = charToCoords.get(pChar)!;
            if (S_digits[rP_idx] === 0) {
                S_digits[rP_idx] = r;
                changedInLoop = true;
            } else if (S_digits[rP_idx] !== r) {
                throw new Error(`Inconsistency: S_digits[${rP_idx}] already ${S_digits[rP_idx]}, but ${pChar} suggests ${r}`);
            }
            if (S_digits[cP_idx] === 0) {
                S_digits[cP_idx] = c;
                changedInLoop = true;
            } else if (S_digits[cP_idx] !== c) {
                throw new Error(`Inconsistency: S_digits[${cP_idx}] already ${S_digits[cP_idx]}, but ${pChar} suggests ${c}`);
            }
        }

        // Try to fill S_digits based on known charToCoords for C1[k]
        if (charToCoords.has(cChar)) {
            const [r, c] = charToCoords.get(cChar)!;
            if (S_digits[rC_idx] === 0) {
                S_digits[rC_idx] = r;
                changedInLoop = true;
            } else if (S_digits[rC_idx] !== r) {
                throw new Error(`Inconsistency: S_digits[${rC_idx}] already ${S_digits[rC_idx]}, but ${cChar} suggests ${r}`);
            }
            if (S_digits[cC_idx] === 0) {
                S_digits[cC_idx] = c;
                changedInLoop = true;
            } else if (S_digits[cC_idx] !== c) {
                throw new Error(`Inconsistency: S_digits[${cC_idx}] already ${S_digits[cC_idx]}, but ${cChar} suggests ${c}`);
            }
        }
    }

    // Phase 2: Propagate from S_digits to charToCoords and polybiusGrid
    // If S_digits values are known, we can deduce char-to-coords mappings
    for (let k = 0; k < L; k++) {
        const pChar = p1Clean[k];
        const cChar = c1Clean[k];

        const rP_idx = k;
        const cP_idx = k + L;
        const rC_idx = 2 * k;
        const cC_idx = 2 * k + 1;

        // Try to update charToCoords/polybiusGrid for P1[k] if its S_digits are known
        if (S_digits[rP_idx] !== 0 && S_digits[cP_idx] !== 0) {
            changedInLoop = updateMappings(pChar, S_digits[rP_idx], S_digits[cP_idx]) || changedInLoop;
        }

        // Try to update charToCoords/polybiusGrid for C1[k] if its S_digits are known
        if (S_digits[rC_idx] !== 0 && S_digits[cC_idx] !== 0) {
            changedInLoop = updateMappings(cChar, S_digits[rC_idx], S_digits[cC_idx]) || changedInLoop;
        }
    }
}

// --- Decrypt cipherText2 using the derived Polybius square ---
const c2Clean = cleanText(cipherText2);
const L2 = c2Clean.length;

// Step 1: Convert ciphertext2 characters to their coordinates
const c2_r_coords: number[] = Array(L2).fill(0);
const c2_c_coords: number[] = Array(L2).fill(0);

for (let k = 0; k < L2; k++) {
    const char = c2Clean[k];
    if (!charToCoords.has(char)) {
        // This indicates the key was not fully recovered for all characters present in cipherText2.
        // This implies the plainText1/cipherText1 pair was not sufficient or an issue with problem input.
        throw new Error(`Character '${char}' from cipherText2 not found in derived Polybius square. Key not fully determined.`);
    }
    const [r, c] = charToCoords.get(char)!;
    c2_r_coords[k] = r;
    c2_c_coords[k] = c;
}

// Step 2: Form plaintext coordinates by taking (row from c2_r_coords, col from c2_c_coords)
// These sequences ARE the original plaintext coordinates based on Bifid decryption logic.
const plainText2Chars: string[] = [];
for (let k = 0; k < L2; k++) {
    const r = c2_r_coords[k];
    const c = c2_c_coords[k];
    
    if (polybiusGrid[r][c] === null) {
        // This should not happen if the cipherText2 only contains characters whose mappings were deducible.
        throw new Error(`Polybius square cell (${r}, ${c}) is unknown for decryption of PlainText2.`);
    }
    plainText2Chars.push(polybiusGrid[r][c]!);
}

// Output the decrypted plaintext
console.log(plainText2Chars.join(''));