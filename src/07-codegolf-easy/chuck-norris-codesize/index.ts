const MESSAGE: string = readline();

// Convert the input message into a single 7-bit binary string.
// For each character, get its ASCII code, | with 128 (to ensure 8 bits with leading 1),
// convert to binary string, and then slice the first bit (the added 1).
const fullBinaryString = [...MESSAGE].map(c => (c.charCodeAt(0) | 128).toString(2).slice(1)).join('');

// Use a regular expression to find all consecutive runs of '1's or '0's.
// 'match' returns an array of the matched substrings (e.g., ['1', '0000', '11']).
const matches = fullBinaryString.match(/(1+)|(0+)/g);

let result: string[] = [];

// Iterate through each matched block of consecutive bits.
for (const block of matches) {
    const bit = block[0]; // The value of the bit in the current block ('1' or '0').
    const count = block.length; // The number of times this bit repeats.

    // Append the first part of the unary encoding: '0' for '1's, '00' for '0's.
    result.push(bit === '1' ? '0' : '00');
    
    // Append the second part of the unary encoding: 'count' number of '0's.
    result.push('0'.repeat(count));
}

// Join all the encoded blocks with a single space and print the result.
console.log(result.join(' '));