import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// --- Constants for Blood Type and Gene Mappings ---

// ABO Blood Type to Gene Pairs (e.g., 'A' can be ['AA', 'AO'])
const ABO_TYPE_TO_GENES: { [key: string]: string[] } = {
    'A': ['AA', 'AO'],
    'B': ['BB', 'BO'],
    'AB': ['AB'],
    'O': ['OO']
};

// Rh Factor to Gene Pairs (e.g., '+' can be ['++', '+-'])
const RH_TYPE_TO_GENES: { [key: string]: string[] } = {
    '+': ['++', '+-'],
    '-': ['--']
};

// Gene Pair to ABO Blood Type (normalized gene pairs)
const ABO_GENE_PAIR_TO_TYPE: { [key: string]: string } = {
    'AA': 'A', 'AO': 'A',
    'BB': 'B', 'BO': 'B',
    'OO': 'O',
    'AB': 'AB',
};

// Gene Pair to Rh Factor (normalized gene pairs)
const RH_GENE_PAIR_TO_TYPE: { [key: string]: string } = {
    '++': '+', '+-': '+',
    '--': '-'
};

// All possible ABO gene pairs (used for iterating candidates for unknown parent/child)
const ALL_ABO_GENE_PAIRS = Object.keys(ABO_GENE_PAIR_TO_TYPE);
// All possible Rh gene pairs
const ALL_RH_GENE_PAIRS = Object.keys(RH_GENE_PAIR_TO_TYPE);

// --- Helper Functions ---

/**
 * Normalizes a gene pair string by sorting its characters alphabetically.
 * E.g., 'OA' becomes 'AO', '-+' becomes '+-'.
 * This ensures consistent keys for map lookups.
 */
function normalizeGenePair(pair: string): string {
    return pair.split('').sort().join('');
}

/**
 * Parses a full blood type string (e.g., "A+", "AB-") into its ABO and Rh components.
 */
function parseBloodType(bloodTypeStr: string): { abo: string, rh: string } {
    if (bloodTypeStr.length === 2) { // e.g., A+, O-
        return {
            abo: bloodTypeStr[0],
            rh: bloodTypeStr[1]
        };
    } else if (bloodTypeStr.length === 3) { // e.g., AB+, AB-
        return {
            abo: bloodTypeStr.substring(0, 2),
            rh: bloodTypeStr[2]
        };
    }
    // This case should not be reached given problem constraints, but useful for robustness.
    throw new Error(`Invalid blood type string: ${bloodTypeStr}`);
}

/**
 * Formats ABO and Rh components into a full blood type string.
 */
function formatBloodType(abo: string, rh: string): string {
    return `${abo}${rh}`;
}

/**
 * Returns all possible gene pairs (e.g., ['AA', 'AO']) for a given blood type.
 * If the bloodType is '?', it returns all possible gene pairs for that system (ABO or Rh).
 * @param bloodType The blood type string (e.g., 'A', '+', or '?').
 * @param isRh True if calculating for Rh factor, false for ABO.
 */
function getPossibleGenePairsForBloodType(bloodType: string, isRh: boolean): string[] {
    if (bloodType === '?') {
        return isRh ? ALL_RH_GENE_PAIRS : ALL_ABO_GENE_PAIRS;
    }
    return isRh ? RH_TYPE_TO_GENES[bloodType] : ABO_TYPE_TO_GENES[bloodType];
}

/**
 * Converts a normalized gene pair to its corresponding blood type.
 * @param genePair A normalized gene pair string (e.g., 'AO', '+-').
 * @param isRh True if converting for Rh factor, false for ABO.
 */
function getBloodTypeFromGenePair(genePair: string, isRh: boolean): string | undefined {
    const normalizedPair = normalizeGenePair(genePair);
    return isRh ? RH_GENE_PAIR_TO_TYPE[normalizedPair] : ABO_GENE_PAIR_TO_TYPE[normalizedPair];
}

/**
 * Calculates all possible child gene pairs given the possible gene pairs of two parents.
 * Each parent's gene possibilities is an array of strings (e.g., ['AA', 'AO']).
 * Returns a Set of normalized child gene pair strings (e.g., {'AO', 'OO'}).
 */
function getChildGenePairs(
    parent1GenePossibilities: string[],
    parent2GenePossibilities: string[]
): Set<string> {
    const childGenePairs = new Set<string>();
    for (const p1Genotype of parent1GenePossibilities) {
        const p1Gene1 = p1Genotype[0];
        const p1Gene2 = p1Genotype[1];
        for (const p2Genotype of parent2GenePossibilities) {
            const p2Gene1 = p2Genotype[0];
            const p2Gene2 = p2Genotype[1];

            // A child inherits one gene from each of the parent's two genes
            childGenePairs.add(normalizeGenePair(p1Gene1 + p2Gene1));
            childGenePairs.add(normalizeGenePair(p1Gene1 + p2Gene2));
            childGenePairs.add(normalizeGenePair(p1Gene2 + p2Gene1));
            childGenePairs.add(normalizeGenePair(p1Gene2 + p2Gene2));
        }
    }
    return childGenePairs;
}

/**
 * Calculates all possible gene pairs for an unknown parent given the known parent and child gene possibilities.
 * A candidate parent gene pair is considered possible if it can produce at least one child gene pair
 * that is among the actual child's possible gene pairs.
 * @param knownParentGenePossibilities Possible gene pairs of the known parent (e.g., ['AA', 'AO']).
 * @param childGenePossibilities Possible gene pairs of the child (e.g., ['AA', 'AO']).
 * @param isRh True for Rh calculation, false for ABO.
 * Returns a Set of normalized gene pair strings for the unknown parent.
 */
function getParentGenePairs(
    knownParentGenePossibilities: string[],
    childGenePossibilities: string[],
    isRh: boolean
): Set<string> {
    const possibleUnknownParentGenePairs = new Set<string>();

    const allPossibleCandidateGenePairs = isRh ? ALL_RH_GENE_PAIRS : ALL_ABO_GENE_PAIRS;

    for (const candidateParentGenePair of allPossibleCandidateGenePairs) {
        // Calculate all child gene pairs that could result from (knownParent + candidateParent)
        const generatedChildGenePairsForCandidate = getChildGenePairs(
            knownParentGenePossibilities,
            [candidateParentGenePair] // Treat the candidate as a single genotype possibility for the other parent
        );

        // Check for overlap: If any of the produced child gene pairs is present in the actual child's possibilities.
        let isCandidatePossible = false;
        for (const generatedGcPair of generatedChildGenePairsForCandidate) {
            if (childGenePossibilities.includes(generatedGcPair)) {
                isCandidatePossible = true;
                break;
            }
        }

        if (isCandidatePossible) {
            possibleUnknownParentGenePairs.add(candidateParentGenePair);
        }
    }
    return possibleUnknownParentGenePairs;
}

// --- Main Logic ---

function solve(): void {
    let N: number | undefined; // Number of test cases
    const lines: string[] = []; // Stores input lines

    // Event listener for each line of input
    rl.on('line', (line) => {
        if (N === undefined) {
            N = parseInt(line); // First line is N
        } else {
            lines.push(line); // Subsequent lines are test cases
            if (lines.length === N) {
                processInput(); // All input received, process it
                rl.close();     // Close readline interface
            }
        }
    });

    /**
     * Processes all collected input lines and prints results for each.
     */
    function processInput(): void {
        for (const line of lines) {
            const [p1Str, p2Str, cStr] = line.split(' ');

            let unknownIndex: number; // 0 for p1, 1 for p2, 2 for child
            if (p1Str === '?') unknownIndex = 0;
            else if (p2Str === '?') unknownIndex = 1;
            else unknownIndex = 2;

            // Parse known blood types; for unknown, assign '?' to abo/rh
            const p1 = p1Str === '?' ? { abo: '?', rh: '?' } : parseBloodType(p1Str);
            const p2 = p2Str === '?' ? { abo: '?', rh: '?' } : parseBloodType(p2Str);
            const child = cStr === '?' ? { abo: '?', rh: '?' } : parseBloodType(cStr);

            let possibleABOTypes: Set<string> = new Set();
            let possibleRhTypes: Set<string> = new Set();

            if (unknownIndex === 2) { // Child's blood type is unknown
                // Calculate possible ABO types for the child
                const p1ABOGenes = getPossibleGenePairsForBloodType(p1.abo, false);
                const p2ABOGenes = getPossibleGenePairsForBloodType(p2.abo, false);
                const childABOGenePairs = getChildGenePairs(p1ABOGenes, p2ABOGenes);
                for (const genePair of childABOGenePairs) {
                    const type = getBloodTypeFromGenePair(genePair, false);
                    if (type) possibleABOTypes.add(type);
                }

                // Calculate possible Rh types for the child
                const p1RhGenes = getPossibleGenePairsForBloodType(p1.rh, true);
                const p2RhGenes = getPossibleGenePairsForBloodType(p2.rh, true);
                const childRhGenePairs = getChildGenePairs(p1RhGenes, p2RhGenes);
                for (const genePair of childRhGenePairs) {
                    const type = getBloodTypeFromGenePair(genePair, true);
                    if (type) possibleRhTypes.add(type);
                }
            } else { // A parent's blood type is unknown
                // Determine which parent is known and which is unknown from the input
                const knownParent = unknownIndex === 0 ? p2 : p1;
                
                // Calculate possible ABO types for the unknown parent
                const knownParentABOGenes = getPossibleGenePairsForBloodType(knownParent.abo, false);
                const childABOGenes = getPossibleGenePairsForBloodType(child.abo, false);
                const unknownParentABOGenePairs = getParentGenePairs(knownParentABOGenes, childABOGenes, false);
                for (const genePair of unknownParentABOGenePairs) {
                    const type = getBloodTypeFromGenePair(genePair, false);
                    if (type) possibleABOTypes.add(type);
                }

                // Calculate possible Rh types for the unknown parent
                const knownParentRhGenes = getPossibleGenePairsForBloodType(knownParent.rh, true);
                const childRhGenes = getPossibleGenePairsForBloodType(child.rh, true);
                const unknownParentRhGenePairs = getParentGenePairs(knownParentRhGenes, childRhGenes, true);
                for (const genePair of unknownParentRhGenePairs) {
                    const type = getBloodTypeFromGenePair(genePair, true);
                    if (type) possibleRhTypes.add(type);
                }
            }

            // Combine possible ABO and Rh types into full blood types
            const finalPossibleBloodTypes: string[] = [];
            for (const aboType of possibleABOTypes) {
                for (const rhType of possibleRhTypes) {
                    finalPossibleBloodTypes.push(formatBloodType(aboType, rhType));
                }
            }

            // Output the result
            if (finalPossibleBloodTypes.length === 0) {
                console.log('impossible');
            } else {
                finalPossibleBloodTypes.sort(); // Sort by ASCII order
                console.log(finalPossibleBloodTypes.join(' '));
            }
        }
    }
}

// Start the solver
solve();