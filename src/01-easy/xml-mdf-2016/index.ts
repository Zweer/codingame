const sequence = readline();

    // Initialize tag weights for all lowercase letters
    // Using a Map for clarity, though a plain object would also work.
    const tagWeights: Map<string, number> = new Map<string, number>();
    for (let i = 0; i < 26; i++) {
        const char = String.fromCharCode('a'.charCodeAt(0) + i);
        tagWeights.set(char, 0.0);
    }

    let currentDepth: number = 0;
    let i: number = 0;

    // Parse the sequence character by character (or token by token)
    // and calculate weights based on depth
    while (i < sequence.length) {
        const char = sequence[i];

        if (char === '-') {
            // This is a closing tag (e.g., '-a')
            // The tag character is the one immediately after the hyphen
            const tagChar = sequence[i + 1];
            currentDepth--; // Exiting a tag decreases depth for subsequent tags
            i += 2; // Move past the hyphen and the tag character
        } else {
            // This is an opening tag (e.g., 'a')
            const tagChar = char;
            currentDepth++; // Entering a tag increases depth for current and subsequent tags

            // Add the reciprocal of the current depth to the tag's total weight
            tagWeights.set(tagChar, (tagWeights.get(tagChar) || 0) + (1 / currentDepth));
            i++; // Move past the tag character
        }
    }

    // Find the tag with the greatest weight
    let maxWeight: number = -1; // Initialize with a value lower than any possible weight
    let resultTag: string = '';

    // Iterate through all possible tag letters from 'a' to 'z'
    // This order naturally handles the tie-breaking rule (alphabetically smallest)
    for (let charCode = 'a'.charCodeAt(0); charCode <= 'z'.charCodeAt(0); charCode++) {
        const tagChar = String.fromCharCode(charCode);
        const weight = tagWeights.get(tagChar) || 0; // Retrieve weight, default to 0 if not present (shouldn't happen due to initialization)

        if (weight > maxWeight) {
            // Found a new maximum weight
            maxWeight = weight;
            resultTag = tagChar;
        }
        // If weight === maxWeight, we do nothing because resultTag is already
        // holding the alphabetically smaller tag due to our iteration order.
    }

    // Output the result
    console.log(resultTag);
