// The `readline()` function is provided by the CodinGame environment for reading input.
// The `console.log()` function is used for printing output.

// Read N, the number of lines/compounds to process
const N: number = parseInt(readline());

// Loop through each compound
for (let i = 0; i < N; i++) {
    const compound: string = readline();
    let isValid: boolean = true; // Flag to track validity of the current compound

    // Regex to match either CHn (where n is 0-4) or (m) (where m is 1-4)
    // - Group 1: captures CHn (e.g., "CH3")
    // - Group 2: captures (m) (e.g., "(1)")
    // The 'g' flag (global) is crucial for `regex.exec` to find all matches in a loop.
    const regex = /(CH[0-4])|(\([1-4]\))/g;
    let match: RegExpExecArray | null;

    // Array to store parsed carbon units and bond units as objects
    const parts: ({ type: 'CH', n: number } | { type: 'bond', m: number })[] = [];

    // Parse the compound string into its constituent parts
    // The problem guarantees a "valid representation", so we focus on extracting values.
    while ((match = regex.exec(compound)) !== null) {
        if (match[1]) { // If Group 1 matched (it's a CHn unit)
            // Extract 'n' from "CHn" string (e.g., "CH3" -> 3)
            const n = parseInt(match[1].substring(2));
            parts.push({ type: 'CH', n: n });
        } else if (match[2]) { // If Group 2 matched (it's an (m) bond)
            // Extract 'm' from "(m)" string (e.g., "(1)" -> 1)
            const m = parseInt(match[2].substring(1, match[2].length - 1));
            parts.push({ type: 'bond', m: m });
        }
    }

    // Iterate through the parsed parts to validate bond counts for each carbon (CH) unit
    for (let j = 0; j < parts.length; j++) {
        const part = parts[j];

        if (part.type === 'CH') {
            // A carbon atom typically forms 4 bonds. 'n' hydrogens consume 'n' bonds.
            // The remaining (4 - n) bonds must be formed with other carbon atoms through (m) units.
            const requiredBonds = 4 - part.n;
            let actualBonds = 0;

            // Check the unit immediately to the left for a bond
            // A CH unit at index `j` can only have a bond at `j-1` if `j > 0`.
            // Due to "valid representation", `parts[j-1]` will be a bond if it exists.
            if (j > 0) {
                const leftPart = parts[j - 1];
                // Type assertion is safe here because of the 'valid representation' guarantee.
                actualBonds += (leftPart as { type: 'bond', m: number }).m;
            }

            // Check the unit immediately to the right for a bond
            // A CH unit at index `j` can only have a bond at `j+1` if `j` is not the last element.
            // Due to "valid representation", `parts[j+1]` will be a bond if it exists.
            if (j < parts.length - 1) {
                const rightPart = parts[j + 1];
                // Type assertion is safe here.
                actualBonds += (rightPart as { type: 'bond', m: number }).m;
            }

            // If the actual number of bonds connected to this carbon unit
            // does not match the required number, the compound is invalid.
            if (actualBonds !== requiredBonds) {
                isValid = false;
                break; // No need to check further for this compound, it's already invalid.
            }
        }
        // Bond units themselves (type 'bond') do not have valence rules to check;
        // their 'm' values are simply consumed by the adjacent CH units.
    }

    // Output the validation result for the current compound
    if (isValid) {
        console.log("VALID");
    } else {
        console.log("INVALID");
    }
}