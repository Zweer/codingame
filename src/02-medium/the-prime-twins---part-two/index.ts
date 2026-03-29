// readline and print functions for CodinGame environment
declare function readline(): string;
declare function print(message: string): void;

// Maximum value needed for prime search.
// Max key is 5*10^6. Max 'i' for a long message (e.g., 10000 chars) can be around 2.5*10^6.
// The 'p' in (p, p+2) could be up to 'prev_encoded_val_for_calc', which can be key + i.
// So, max 'p' could be around 5*10^6 + 2.5*10^6 = 7.5*10^6.
// We need to sieve up to this value + 2.
const MAX_PRIME_SEARCH_LIMIT = 8_000_000;

// Global arrays for precomputed primes and 'i' values
const isPrime: boolean[] = new Array(MAX_PRIME_SEARCH_LIMIT + 1).fill(true);
const sorted_i_values: number[] = [];

/**
 * Precomputes prime numbers using Sieve of Eratosthenes and collects numbers 'i'
 * which are between prime twin pairs (p, p+2), i.e., i = p+1.
 * This function is called once at the start of the program.
 */
function precomputePrimes() {
    // Initialize 0 and 1 as not prime
    isPrime[0] = false;
    isPrime[1] = false;

    // Sieve of Eratosthenes
    for (let p = 2; p * p <= MAX_PRIME_SEARCH_LIMIT; p++) {
        if (isPrime[p]) {
            for (let multiple = p * p; multiple <= MAX_PRIME_SEARCH_LIMIT; multiple += p) {
                isPrime[multiple] = false;
            }
        }
    }

    // Collect 'i' values (p+1) for all prime twin pairs (p, p+2)
    // We iterate up to MAX_PRIME_SEARCH_LIMIT - 2 because we need to check p+2.
    for (let p = 2; p <= MAX_PRIME_SEARCH_LIMIT - 2; p++) {
        if (isPrime[p] && isPrime[p + 2]) {
            sorted_i_values.push(p + 1);
        }
    }
}

// Perform precomputation immediately when the script starts
precomputePrimes();

/**
 * Encodes a message based on the given key and rules.
 * @param key The secret key.
 * @param message The message to encode (uppercase letters and spaces).
 * @returns The encoded message string or "ERROR !!" if invalid.
 */
function encodeMessage(key: number, message: string): string {
    const output_hex_parts: string[] = []; // Stores the calculated hex values for letters
    const message_segment_types: ('hex' | 'space')[] = []; // Tracks if a segment is a letter's hex or a space, for output formatting

    let prev_encoded_val_for_calc: number | null = null; // Stores the encoded value of the *previous* letter, for 'i' calculation

    // Iterate through the message to calculate encoded values and determine segment types
    for (const char of message) {
        if (char === ' ') {
            message_segment_types.push('space');
        } else if (char >= 'A' && char <= 'Z') {
            message_segment_types.push('hex');

            let current_encoded_val: number;
            if (prev_encoded_val_for_calc === null) {
                // For the very first letter (conceptually 'A'), it's key + key
                current_encoded_val = key + key;
            } else {
                let next_i_val: number | undefined;
                let found_next_i = false;

                // Find the smallest 'i' (between prime twins p, p+2)
                // such that p (i-1) is strictly greater than prev_encoded_val_for_calc.
                for (const candidate_i_val of sorted_i_values) {
                    const candidate_p = candidate_i_val - 1;
                    if (candidate_p > prev_encoded_val_for_calc) {
                        next_i_val = candidate_i_val;
                        found_next_i = true;
                        break;
                    }
                }

                // If no next 'i' found, it implies the message is too long for the precomputed primes or an invalid scenario.
                if (!found_next_i) {
                    return "ERROR !!";
                }
                current_encoded_val = key + next_i_val!;
            }
            output_hex_parts.push(current_encoded_val.toString(16).toUpperCase());
            prev_encoded_val_for_calc = current_encoded_val;
        } else {
            // Message contains characters other than uppercase letters and spaces
            return "ERROR !!";
        }
    }

    // Assemble the final output string based on calculated hex parts and segment types
    let final_output = "";
    let hex_part_idx = 0; // Index for `output_hex_parts`

    for (let i = 0; i < message_segment_types.length; i++) {
        const segment_type = message_segment_types[i];

        if (segment_type === 'space') {
            final_output += "GG";
        } else { // 'hex' type corresponds to a letter's encoded value
            final_output += output_hex_parts[hex_part_idx];
            hex_part_idx++;
        }

        // Add separator if it's not the very last segment in the message
        if (i < message_segment_types.length - 1) {
            // Add 'G' separator only if both the current segment and the next segment are hex values (i.e., letters)
            if (segment_type === 'hex' && message_segment_types[i + 1] === 'hex') {
                final_output += "G";
            }
            // 'GG' for spaces is handled by directly appending "GG" when a 'space' segment is encountered.
        }
    }
    return final_output;
}

/**
 * Decodes an encoded message based on the given key and rules.
 * @param key The secret key.
 * @param message The encoded message (uppercase hexadecimal values and 'G').
 * @returns The decoded message string or "ERROR !!" if invalid.
 */
function decodeMessage(key: number, message: string): string {
    // 1. Strict Input Validation and Tokenization
    // Basic character set check
    if (!/^[0-9A-FG]+$/.test(message)) {
        return "ERROR !!";
    }

    // Tokenize the message into hex value strings and separator strings ('G' or 'GG')
    const tokens: string[] = [];
    let match: RegExpExecArray | null;
    // Regex matches either a sequence of hex characters OR a 'G' or 'GG' sequence.
    const regex = /([0-9A-F]+)|(G{1,2})/g;
    while ((match = regex.exec(message)) !== null) {
        if (match[1]) { // Matched a hex part
            tokens.push(match[1]);
        } else if (match[2]) { // Matched a 'G' or 'GG' part
            tokens.push(match[2]);
        }
    }
    
    // Validate the sequence of tokens: must be HEX (SEP HEX)*
    // This structure implies an odd number of tokens, starting and ending with a HEX part.
    if (tokens.length === 0 || tokens.length % 2 === 0 || 
        !/^[0-9A-F]+$/.test(tokens[0]) || !/^[0-9A-F]+$/.test(tokens[tokens.length-1])) {
        return "ERROR !!";
    }
    
    // Ensure tokens strictly alternate between HEX and SEP (G or GG)
    for (let i = 0; i < tokens.length; i++) {
        if (i % 2 === 0) { // Expected to be a HEX token
            if (!/^[0-9A-F]+$/.test(tokens[i])) return "ERROR !!";
        } else { // Expected to be a SEP (G or GG) token
            if (tokens[i] !== 'G' && tokens[i] !== 'GG') return "ERROR !!";
        }
    }

    // 2. Decode Logic using the validated tokens
    let prev_encoded_val_for_calc: number | null = null; // Stores the decoded value of the *previous* letter
    const decoded_message_chars: string[] = []; // Collects decoded characters (letters and spaces)

    for (const token of tokens) {
        if (token === 'G') {
            // A single 'G' is a separator between letters, it does not represent a character itself.
            continue;
        } else if (token === 'GG') {
            // 'GG' represents a space character.
            decoded_message_chars.push(' ');
        } else { // Token is a hexadecimal value string
            const current_encoded_val = parseInt(token, 16);
            
            // Check if parsing resulted in NaN (shouldn't happen with regex but for robustness)
            if (isNaN(current_encoded_val)) {
                return "ERROR !!";
            }

            if (prev_encoded_val_for_calc === null) {
                // This is the first letter being decoded. It must correspond to 'A'.
                if (current_encoded_val !== key + key) {
                    return "ERROR !!"; // The first encoded value doesn't match 'A' rule.
                }
                decoded_message_chars.push('A');
            } else {
                // For subsequent letters, calculate the required 'i' value.
                const required_i_val = current_encoded_val - key;
                if (required_i_val <= 0) { // 'i' must be a positive integer as it's between prime twins.
                    return "ERROR !!";
                }

                let found_match = false;
                // Find the smallest 'i' (between prime twins p, p+2) in `sorted_i_values`
                // such that p (i-1) is strictly greater than `prev_encoded_val_for_calc`.
                // This found 'i' value MUST be equal to `required_i_val`.
                for (const candidate_i_val of sorted_i_values) {
                    const candidate_p = candidate_i_val - 1;
                    if (candidate_p > prev_encoded_val_for_calc) {
                        if (candidate_i_val === required_i_val) {
                            found_match = true;
                            break; // Found the correct 'i'. Since sorted_i_values is ordered, this is the closest valid 'i'.
                        } else {
                            // The `required_i_val` is not the *closest* valid 'i' value that comes after `prev_encoded_val_for_calc`.
                            // This indicates an invalid sequence in the encoded message.
                            return "ERROR !!";
                        }
                    }
                }

                // If no matching 'i' was found at all based on the criteria.
                if (!found_match) {
                    return "ERROR !!";
                }

                // Determine the character (B, C, etc.) based on its sequential position.
                // Spaces do not consume a letter slot in the A, B, C... sequence.
                const decoded_char_code = 'A'.charCodeAt(0) + (decoded_message_chars.filter(c => c !== ' ').length);
                if (decoded_char_code > 'Z'.charCodeAt(0)) {
                    // Decoded beyond 'Z', implies an invalid extremely long message or sequence.
                    return "ERROR !!";
                }
                decoded_message_chars.push(String.fromCharCode(decoded_char_code));
            }
            // Update `prev_encoded_val_for_calc` for the next letter's calculation.
            prev_encoded_val_for_calc = current_encoded_val;
        }
    }

    // Join all decoded characters (letters and spaces) to form the final message.
    return decoded_message_chars.join('');
}

// Main program execution flow for CodinGame
const operation: string = readline();
const key: number = parseInt(readline());
const message: string = readline();

if (operation === "ENCODE") {
    print(encodeMessage(key, message));
} else if (operation === "DECODE") {
    print(decodeMessage(key, message));
}