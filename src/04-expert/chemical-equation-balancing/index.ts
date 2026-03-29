// Assume readline is available in the environment for CodinGame
declare function readline(): string;
declare function print(message: any): void; // For console.log

// --- Utility Functions for Math ---

/**
 * Calculates the Greatest Common Divisor (GCD) of two numbers using the Euclidean algorithm.
 * @param a First number.
 * @param b Second number.
 * @returns The GCD of a and b.
 */
function gcd(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
        [a, b] = [b, a % b];
    }
    return a;
}

/**
 * Calculates the Least Common Multiple (LCM) of two numbers.
 * @param a First number.
 * @param b Second number.
 * @returns The LCM of a and b.
 */
function lcm(a: number, b: number): number {
    if (a === 0 || b === 0) return 0;
    return Math.abs(a * b) / gcd(a, b);
}

/**
 * Calculates the LCM for an array of numbers.
 * @param numbers An array of numbers.
 * @returns The LCM of all numbers in the array.
 */
function lcmMany(numbers: number[]): number {
    if (numbers.length === 0) return 1;
    let result = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
        result = lcm(result, numbers[i]);
    }
    return result;
}

/**
 * Tries to infer the smallest integer denominator for a given floating-point number.
 * This is used to convert floating-point coefficients to integers by finding a common multiplier.
 * @param num The floating-point number.
 * @param max_denominator_search The maximum denominator to search for (prevents infinite loops for irrational numbers).
 * @returns The implied integer denominator, or 1 if an integer or not found within limits.
 */
function getImpliedDenominator(num: number, max_denominator_search = 100000): number {
    if (num === 0) return 1;
    const EPSILON = 1e-9; // Tolerance for floating point comparisons
    
    // If already an integer (within tolerance), denominator is 1
    if (Math.abs(num - Math.round(num)) < EPSILON) {
        return 1;
    }

    // Search for an integer 'd' such that 'num * d' is an integer
    for (let d = 1; d <= max_denominator_search; d++) {
        if (Math.abs(num * d - Math.round(num * d)) < EPSILON) {
            return d;
        }
    }
    // Fallback: If no simple integer denominator is found, assume 1.
    // This might lead to non-integer results if the fraction is very complex,
    // but should be sufficient for competitive programming problems.
    return 1;
}

// --- Molecule Class ---

/**
 * Represents a chemical molecule, parsing its name into constituent elements and their counts.
 */
class Molecule {
    name: string;
    elements: Map<string, number>; // Maps element symbol (e.g., "H") to its count in the molecule

    constructor(name: string) {
        this.name = name;
        this.elements = new Map();
        this.parse();
    }

    /**
     * Parses the molecule name (e.g., "C6H12O6") to extract element counts.
     */
    private parse() {
        // Regex: Matches an element symbol ([A-Z][a-z]?) followed by an optional number (\d*)
        const regex = /([A-Z][a-z]?)(\d*)/g;
        let match: RegExpExecArray | null;
        
        // Loop through all matches in the molecule name
        while ((match = regex.exec(this.name)) !== null) {
            const element = match[1];      // e.g., "C", "H", "O"
            const countStr = match[2];     // e.g., "6", "12", "6", or "" if no number
            // If countStr is empty, default count is 1. Otherwise, parse as integer.
            const count = countStr ? parseInt(countStr, 10) : 1;
            
            // Add the count to the element's total in this molecule
            this.elements.set(element, (this.elements.get(element) || 0) + count);
        }
    }
}

// --- Main Solution Function ---

/**
 * Solves the chemical equation balancing puzzle.
 */
function solveEquation() {
    const equationString: string = readline(); // Read the input chemical equation

    // Split the equation into left (reactants) and right (products) sides
    const parts = equationString.split(' -> ');
    const leftSideMolNames = parts[0].split(' + ');
    const rightSideMolNames = parts[1].split(' + ');

    // Parse molecule names into Molecule objects
    const leftSideMolecules = leftSideMolNames.map(s => new Molecule(s));
    const rightSideMolecules = rightSideMolNames.map(s => new Molecule(s));

    // Combine all molecules for matrix construction
    const allMolecules = [...leftSideMolecules, ...rightSideMolecules];

    // 1. Collect all unique elements present in the entire equation
    const uniqueElements = new Set<string>();
    for (const mol of allMolecules) {
        for (const element of mol.elements.keys()) {
            uniqueElements.add(element);
        }
    }
    // Sort elements alphabetically for consistent matrix row ordering
    const elementList = Array.from(uniqueElements).sort();

    // 2. Build the stoichiometric matrix
    // The matrix dimensions will be (number of unique elements) x (total number of molecules)
    const numElements = elementList.length;
    const numMolecules = allMolecules.length;
    const matrix: number[][] = Array.from({ length: numElements }, () => Array(numMolecules).fill(0));

    for (let i = 0; i < numElements; i++) {
        const element = elementList[i];
        for (let j = 0; j < numMolecules; j++) {
            const molecule = allMolecules[j];
            const count = molecule.elements.get(element) || 0;
            // Reactants (left side) have positive counts, products (right side) have negative counts
            if (j < leftSideMolecules.length) { // Molecule is on the left side
                matrix[i][j] = count;
            } else { // Molecule is on the right side
                matrix[i][j] = -count;
            }
        }
    }

    // 3. Solve the homogeneous system Ax = 0 using Gaussian elimination to RREF
    let lead = 0; // Tracks the current pivot column index
    const EPSILON = 1e-9; // Tolerance for floating-point comparisons

    // Iterate through rows (equations) and perform elimination
    for (let r = 0; r < numElements && lead < numMolecules; r++) {
        let i = r; // Current row index to search for a pivot
        // Find a row with a non-zero element in the current 'lead' column
        while (i < numElements && Math.abs(matrix[i][lead]) < EPSILON) {
            i++;
        }

        if (i < numElements) { // A pivot row was found
            // Swap the current row 'r' with the pivot row 'i'
            [matrix[r], matrix[i]] = [matrix[i], matrix[r]];

            // Normalize the pivot row: divide by the pivot value to make it 1
            let pivotVal = matrix[r][lead];
            for (let j = lead; j < numMolecules; j++) {
                matrix[r][j] /= pivotVal;
            }

            // Eliminate other entries in the pivot column: make them zero
            for (let i_row = 0; i_row < numElements; i_row++) {
                if (i_row !== r) { // For all rows other than the current pivot row
                    let factor = matrix[i_row][lead];
                    for (let j = lead; j < numMolecules; j++) {
                        matrix[i_row][j] -= factor * matrix[r][j];
                    }
                }
            }
            lead++; // Move to the next pivot column
        } else {
            // No pivot found in the current 'lead' column.
            // Move to the next column, but stay on the same row 'r' to try and find a pivot there.
            lead++;
            r--; 
        }
    }

    // After Gaussian elimination, the matrix is in RREF (or close to it due to floating point arithmetic).
    // The problem guarantees a unique solution (up to scaling), implying a nullity of 1.
    const coefficients: number[] = Array(numMolecules).fill(0);
    let freeVarCol = -1;
    const pivotCols = new Set<number>();

    // Identify pivot columns (columns that contain a leading '1')
    for (let r = 0; r < numElements; r++) {
        for (let c = 0; c < numMolecules; c++) {
            if (Math.abs(matrix[r][c] - 1) < EPSILON) { // Check for a leading 1
                pivotCols.add(c);
                break; // Move to the next row as this column is a pivot for current row
            }
        }
    }

    // Find the single "free" variable column (the one without a leading 1)
    for (let c = 0; c < numMolecules; c++) {
        if (!pivotCols.has(c)) {
            freeVarCol = c;
            break;
        }
    }

    // Set the coefficient for the free variable to 1 (this will be our initial scale factor)
    coefficients[freeVarCol] = 1.0;

    // Back-substitute to find the coefficients of the basic (pivot) variables
    // Iterate through the rows of the RREF matrix
    for (let r = 0; r < numElements; r++) {
        let pivotCol = -1;
        // Find the pivot column for the current row 'r'
        for (let c = 0; c < numMolecules; c++) {
            if (Math.abs(matrix[r][c] - 1) < EPSILON) { // Found a leading 1
                pivotCol = c;
                break;
            }
        }

        // If this row corresponds to a basic variable (i.e., it has a pivot, and it's not the free variable)
        if (pivotCol !== -1 && pivotCol !== freeVarCol) {
            // In RREF with only one free variable, the equation for a pivot row 'r' is:
            // x[pivotCol] + matrix[r][freeVarCol] * x[freeVarCol] = 0
            // So, x[pivotCol] = -matrix[r][freeVarCol] * x[freeVarCol]
            coefficients[pivotCol] = -matrix[r][freeVarCol] * coefficients[freeVarCol];
        }
    }

    // Ensure all coefficients are positive. If any are negative, flip the signs of all.
    // In a homogeneous system, if x is a solution, -x is also a solution.
    if (coefficients.some(c => c < 0)) {
        for (let i = 0; i < numMolecules; i++) {
            coefficients[i] = -coefficients[i];
        }
    }

    // 4. Convert coefficients to smallest whole integers
    // First, find the LCM of all implied denominators to clear fractions
    const denominators: number[] = [];
    for (const val of coefficients) {
        if (Math.abs(val) > EPSILON) { // Only consider non-zero coefficients
            denominators.push(getImpliedDenominator(val));
        }
    }

    let commonMultiplier = 1;
    if (denominators.length > 0) {
        commonMultiplier = lcmMany(denominators);
    }
    
    // Apply the common multiplier and round to the nearest integer
    let integerCoefficients: number[] = coefficients.map(val => Math.round(val * commonMultiplier));

    // Then, reduce coefficients by their Greatest Common Divisor (GCD) to get the smallest integers
    let currentGCD = 0;
    for (const val of integerCoefficients) {
        if (val !== 0) { // Only consider non-zero values for GCD calculation
            if (currentGCD === 0) { // Initialize GCD with the first non-zero value
                currentGCD = Math.abs(val);
            } else {
                currentGCD = gcd(currentGCD, Math.abs(val));
            }
        }
    }

    if (currentGCD > 1) { // If a common divisor greater than 1 exists, divide all coefficients by it
        integerCoefficients = integerCoefficients.map(val => val / currentGCD);
    }
    
    // Fallback for an unlikely scenario: if all coefficients somehow ended up as zero.
    // For valid chemical equations, this implies an error in logic or a trivial solution [0,0,..0]
    // which is not the goal.
    if (integerCoefficients.every(c => c === 0)) {
        // This should theoretically not be hit given the problem constraints (unique way to balance).
        // If it were, it would imply the system only has the trivial solution, which is not chemical balancing.
        integerCoefficients = Array(numMolecules).fill(1); // Default to 1 (indicating a potential problem)
    }

    // 5. Format and print the balanced equation string
    let outputParts: string[] = [];
    let currentMoleculeIndex = 0;

    // Format the left side of the equation
    let leftOutput: string[] = [];
    for (let i = 0; i < leftSideMolecules.length; i++) {
        const mol = leftSideMolecules[i];
        const coeff = integerCoefficients[currentMoleculeIndex++];
        leftOutput.push(coeff === 1 ? mol.name : `${coeff}${mol.name}`); // Omit coefficient if 1
    }
    outputParts.push(leftOutput.join(' + '));

    outputParts.push('->'); // Add the arrow symbol

    // Format the right side of the equation
    let rightOutput: string[] = [];
    for (let i = 0; i < rightSideMolecules.length; i++) {
        const mol = rightSideMolecules[i];
        const coeff = integerCoefficients[currentMoleculeIndex++];
        rightOutput.push(coeff === 1 ? mol.name : `${coeff}${mol.name}`); // Omit coefficient if 1
    }
    outputParts.push(rightOutput.join(' + '));

    print(outputParts.join(' ')); // Print the final balanced equation
}

// Call the main function to execute the puzzle solution
solveEquation();