// Read N (number of transformations)
const N: number = parseInt(readline());
// Read the message
let message: string = readline();

/**
 * Encodes a message according to the specified alien algorithm.
 * @param message The string to encode.
 * @returns The encoded string.
 */
function encode(message: string): string {
    let currentMessage = message;
    // Using a string array for building the result is more efficient than
    // repeated string concatenations, especially for larger strings.
    let resultParts: string[] = []; 

    let step = 1;
    // `addToEnd` determines if the current part is added to the end (true) or beginning (false)
    let addToEnd = true; 

    while (currentMessage.length > 0) {
        let partLength = step;
        let part: string;

        if (currentMessage.length <= partLength) {
            // If the remaining message is shorter than or equal to the current step length,
            // take the rest of the message as the last part.
            part = currentMessage;
            currentMessage = "";
        } else {
            part = currentMessage.substring(0, partLength);
            currentMessage = currentMessage.substring(partLength);
        }

        if (addToEnd) {
            resultParts.push(part); // Add to the end
        } else {
            resultParts.unshift(part); // Add to the beginning
        }

        step++;
        addToEnd = !addToEnd; // Toggle for the next step
    }

    return resultParts.join('');
}

/**
 * Decodes a message according to the specified alien algorithm.
 * This is the reverse of the encode function.
 * @param message The string to decode.
 * @returns The decoded (original) string.
 */
function decode(message: string): string {
    let currentMessage = message;
    // This array will store parts in the reverse order of their original placement
    // (e.g., last part added, then second to last, etc.).
    let extractedParts: string[] = []; 

    // 1. Determine the lengths of the parts in the order they were originally taken (1, 2, 3, ...)
    let L = message.length;
    let originalPartLengths: number[] = [];
    let k = 0; // Represents the 'step' (length of part) during encoding
    let sumOfLengths = 0; // Sum of lengths of parts already determined

    while (sumOfLengths < L) {
        k++; // Increment step
        let currentPartLength = k;
        if (sumOfLengths + k > L) {
            // The last part takes all remaining characters
            currentPartLength = L - sumOfLengths;
        }
        originalPartLengths.push(currentPartLength);
        sumOfLengths += currentPartLength;
    }
    // At this point, `originalPartLengths` holds the lengths of parts in the order
    // they were *extracted from the original message* (e.g., [1, 2, 3, 3] for "abcdefghi").
    // `k` is the total number of parts, or the "step" of the last part.

    // To reverse the encoding, we need to process parts from the last one added to the first.
    // This means iterating through `originalPartLengths` in reverse order.
    // Create a copy to reverse without modifying the original.
    const partLengthsToExtract = [...originalPartLengths].reverse();

    for (let i = 0; i < partLengthsToExtract.length; i++) {
        const partLen = partLengthsToExtract[i];
        // Calculate the original step number for this part.
        // `i` goes from 0 to `partLengthsToExtract.length - 1`.
        // If `i` is 0, it's the part corresponding to original step `k`.
        // If `i` is 1, it's the part corresponding to original step `k-1`, and so on.
        const originalStep = k - i; 

        // Determine if this part was added to the END or BEGINNING during encoding.
        // Rule: step 1 (odd) -> END, step 2 (even) -> BEGINNING, etc.
        const wasAddedToEnd = (originalStep % 2 !== 0); 

        let extractedPart: string;
        if (wasAddedToEnd) {
            // If it was added to the END, it's currently at the END of currentMessage.
            // Extract it from the end.
            extractedPart = currentMessage.substring(currentMessage.length - partLen);
            currentMessage = currentMessage.substring(0, currentMessage.length - partLen);
        } else {
            // If it was added to the BEGINNING, it's currently at the BEGINNING of currentMessage.
            // Extract it from the beginning.
            extractedPart = currentMessage.substring(0, partLen);
            currentMessage = currentMessage.substring(partLen);
        }
        extractedParts.push(extractedPart);
    }

    // The `extractedParts` array now holds the parts in the reverse order of their original sequence.
    // (e.g., for "ghibcadef", `extractedParts` will be ["ghi", "def", "bc", "a"]).
    // To reconstruct the original message, we need to reverse this array and join them.
    return extractedParts.reverse().join('');
}

// Apply the transformation N times
if (N > 0) {
    // Decode N times
    for (let i = 0; i < N; i++) {
        message = decode(message);
    }
} else if (N < 0) {
    // Encode |N| times
    for (let i = 0; i < Math.abs(N); i++) {
        message = encode(message);
    }
}

// Output the final message
console.log(message);