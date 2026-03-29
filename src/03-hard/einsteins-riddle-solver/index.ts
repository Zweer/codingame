import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let inputLines: string[] = [];
rl.on('line', (line) => {
    inputLines.push(line);
});

rl.on('close', () => {
    solve();
});

function solve() {
    let lineIndex = 0;

    // Read nbCharacteristics and nbPeople
    const [nbCharacteristicsStr, nbPeopleStr] = inputLines[lineIndex++].split(' ');
    const nbCharacteristics = parseInt(nbCharacteristicsStr);
    const nbPeople = parseInt(nbPeopleStr);

    // Store all characteristics by category and map names to category indices
    const allCharacteristicsByCategory: string[][] = [];
    const charToCategoryIndex = new Map<string, number>();
    const allCharacteristicNames: string[] = []; // Flat list of all characteristic names for easy iteration

    for (let i = 0; i < nbCharacteristics; i++) {
        const characteristics = inputLines[lineIndex++].split(' ');
        allCharacteristicsByCategory.push(characteristics);
        for (const char of characteristics) {
            charToCategoryIndex.set(char, i);
            allCharacteristicNames.push(char);
        }
    }

    // Read the number of relational links
    const N = parseInt(inputLines[lineIndex++]);

    // Store initial links
    const initialLinks: { char1: string, char2: string, isLinked: boolean }[] = [];
    for (let i = 0; i < N; i++) {
        const linkStr = inputLines[lineIndex++];
        const parts = linkStr.split(' ');
        const char1 = parts[0];
        const operator = parts[1];
        const char2 = parts[2];
        initialLinks.push({ char1, char2, isLinked: operator === '&' });
    }

    // --- Core Logic ---

    // possiblePairs.get(char1).get(char2) is true if char1 and char2 can be linked, false if they cannot.
    const possiblePairs = new Map<string, Map<string, boolean>>();

    // Helper function to set link status and return true if a change occurred
    // Ensures symmetry and returns true if the status actually changed.
    const setLinkStatus = (char1: string, char2: string, status: boolean): boolean => {
        // Ensure map entries exist for both characteristics
        if (!possiblePairs.has(char1)) {
            possiblePairs.set(char1, new Map<string, boolean>());
        }
        if (!possiblePairs.has(char2)) {
            possiblePairs.set(char2, new Map<string, boolean>());
        }

        const currentStatus1_2 = possiblePairs.get(char1)!.get(char2);

        // If status is already what we're trying to set, no change
        if (currentStatus1_2 === status) {
            return false;
        }

        // Apply the change symmetrically
        possiblePairs.get(char1)!.set(char2, status);
        possiblePairs.get(char2)!.set(char1, status);
        return true; // A change occurred
    };

    // Initialize possiblePairs:
    // - Characteristics from the same category cannot be linked (false)
    // - Characteristics from different categories can initially be linked (true)
    for (const c1 of allCharacteristicNames) {
        for (const c2 of allCharacteristicNames) {
            const cat1 = charToCategoryIndex.get(c1)!;
            const cat2 = charToCategoryIndex.get(c2)!;

            if (cat1 === cat2) {
                // Characteristics from the same category cannot be linked
                setLinkStatus(c1, c2, false);
            } else {
                // Initially, all cross-category characteristics can potentially be linked
                setLinkStatus(c1, c2, true);
            }
        }
    }

    // Apply the initial relational links
    for (const link of initialLinks) {
        setLinkStatus(link.char1, link.char2, link.isLinked);
    }

    // Deduction loop: Continues as long as new information is deduced
    let anyChangeOverall = true; // Start with true to ensure the loop runs at least once
    while (anyChangeOverall) {
        anyChangeOverall = false;

        // Phase 1: Propagate known 'true' links (e.g., if A & B, then A cannot be linked to any other B' from B's category)
        for (const c1 of allCharacteristicNames) {
            for (const c2 of allCharacteristicNames) {
                // If c1 and c2 are definitely linked (possiblePairs.get(c1).get(c2) is true)
                if (possiblePairs.get(c1)!.get(c2) === true) {
                    const cat1 = charToCategoryIndex.get(c1)!;
                    const cat2 = charToCategoryIndex.get(c2)!;

                    // c1 cannot be linked to any other characteristic in c2's category
                    for (const otherC2 of allCharacteristicsByCategory[cat2]) {
                        if (otherC2 !== c2) { // Exclude c2 itself
                            if (setLinkStatus(c1, otherC2, false)) {
                                anyChangeOverall = true;
                            }
                        }
                    }

                    // c2 cannot be linked to any other characteristic in c1's category
                    for (const otherC1 of allCharacteristicsByCategory[cat1]) {
                        if (otherC1 !== c1) { // Exclude c1 itself
                            if (setLinkStatus(c2, otherC1, false)) {
                                anyChangeOverall = true;
                            }
                        }
                    }
                }
            }
        }

        // Phase 2: Deduce new 'true' links (e.g., if a characteristic has only one possibility left in a given category)
        // This phase is crucial and must run after Phase 1 because Phase 1 might reduce possibilities,
        // leading to new deductions in this phase.
        for (const c1 of allCharacteristicNames) {
            const cat1 = charToCategoryIndex.get(c1)!;
            for (let catIdx = 0; catIdx < nbCharacteristics; catIdx++) {
                if (catIdx === cat1) continue; // Skip if the target category is the same as c1's category

                const possibleTargets: string[] = [];
                for (const targetChar of allCharacteristicsByCategory[catIdx]) {
                    if (possiblePairs.get(c1)!.get(targetChar) === true) {
                        possibleTargets.push(targetChar);
                    }
                }

                // If only one possibility remains for c1 in this category, it must be linked to that characteristic
                if (possibleTargets.length === 1) {
                    const deducedTarget = possibleTargets[0];
                    if (setLinkStatus(c1, deducedTarget, true)) {
                        anyChangeOverall = true;
                    }
                }
            }
        }
    }

    // --- Construct Output Grid ---
    // The output grid will have nbCharacteristics rows and nbPeople columns.
    const outputGrid: string[][] = Array.from({ length: nbCharacteristics }, () => Array(nbPeople).fill(''));

    // The first category of characteristics (names) defines the column order, sorted alphabetically.
    const sortedFirstCategoryChars = [...allCharacteristicsByCategory[0]].sort();
    outputGrid[0] = sortedFirstCategoryChars;

    // Fill the rest of the grid by finding the unique link for each person in each category
    for (let j = 0; j < nbPeople; j++) { // Iterate through columns (representing people)
        const personDefiningChar = sortedFirstCategoryChars[j]; // The characteristic defining this person's column
        
        for (let i = 1; i < nbCharacteristics; i++) { // Iterate through other categories (rows)
            for (const charK of allCharacteristicsByCategory[i]) { // Iterate through characteristics in this category
                // Find the characteristic charK that is definitively linked to personDefiningChar
                if (possiblePairs.get(personDefiningChar)!.get(charK) === true) {
                    outputGrid[i][j] = charK;
                    break; // Found the unique link for this person in this category, move to next category
                }
            }
        }
    }

    // Print the solved riddle grid
    for (const row of outputGrid) {
        console.log(row.join(' '));
    }
}