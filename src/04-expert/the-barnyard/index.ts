const readline = require('readline');

// Create an interface for reading lines from standard input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let inputLines: string[] = [];

// Event listener for each line read from input
rl.on('line', (line: string) => {
    inputLines.push(line);
});

// Event listener for the end of input
rl.on('close', () => {
    solve();
});

function solve() {
    // Define the characteristics for each animal species
    // Non-specified characteristics are implicitly 0 (handled by `?? 0` later)
    const ANIMAL_SPECS: { [key: string]: { [prop: string]: number } } = {
        "Rabbits": { "Heads": 1, "Horns": 0, "Legs": 4, "Wings": 0, "Eyes": 2 },
        "Chickens": { "Heads": 1, "Horns": 0, "Legs": 2, "Wings": 2, "Eyes": 2 },
        "Cows": { "Heads": 1, "Horns": 2, "Legs": 4, "Wings": 0, "Eyes": 2 },
        "Pegasi": { "Heads": 1, "Horns": 0, "Legs": 4, "Wings": 2, "Eyes": 2 },
        "Demons": { "Heads": 1, "Horns": 4, "Legs": 4, "Wings": 2, "Eyes": 4 },
    };

    let lineIndex = 0;

    // Read the number of species (n)
    const n = parseInt(inputLines[lineIndex++]);

    // Read the list of species names
    const speciesOrder = inputLines[lineIndex++].split(' ');

    // Read the characteristics and their total counts
    const characteristicNames: string[] = [];
    const characteristicTotals: number[] = [];
    // The problem statement implies 'n' lines of characteristics
    for (let i = 0; i < n; i++) {
        const parts = inputLines[lineIndex++].split(' ');
        characteristicNames.push(parts[0]);
        characteristicTotals.push(parseInt(parts[1]));
    }

    // Build the augmented matrix [A|B] for Gaussian elimination
    // It will be an n x (n+1) matrix
    const augmentedMatrix: number[][] = Array(n).fill(0).map(() => Array(n + 1).fill(0));

    for (let i = 0; i < n; i++) { // Rows represent characteristics
        const charName = characteristicNames[i];
        augmentedMatrix[i][n] = characteristicTotals[i]; // The last column stores the B vector (total counts)

        for (let j = 0; j < n; j++) { // Columns represent species
            const speciesName = speciesOrder[j];
            // Get the characteristic value for the current species and characteristic.
            // Use nullish coalescing `?? 0` to default to 0 if a characteristic isn't explicitly defined
            // for an animal (e.g., Rabbits don't have "Horns" explicitly listed in their brief description,
            // but they implicitly have 0 horns).
            augmentedMatrix[i][j] = ANIMAL_SPECS[speciesName]?.[charName] ?? 0;
        }
    }

    // Gaussian Elimination (Forward Elimination phase)
    for (let k = 0; k < n; k++) { // k is the current pivot row/column
        // Find pivot: Search for the row with the largest absolute value in the current column (k),
        // starting from row k. This is for numerical stability.
        let maxRow = k;
        for (let i = k + 1; i < n; i++) {
            if (Math.abs(augmentedMatrix[i][k]) > Math.abs(augmentedMatrix[maxRow][k])) {
                maxRow = i;
            }
        }

        // Swap the row with the largest pivot element into the current pivot position
        [augmentedMatrix[k], augmentedMatrix[maxRow]] = [augmentedMatrix[maxRow], augmentedMatrix[k]];

        const pivot = augmentedMatrix[k][k];

        // If the pivot is very close to zero, the matrix might be singular or ill-conditioned.
        // For CodinGame puzzles, we generally assume a unique solution exists and pivots will be non-zero.
        if (Math.abs(pivot) < 1e-9) { // Using a small epsilon to check for effectively zero
            // This case indicates no unique solution or an issue with the problem setup for this method.
            // For this specific problem, it should not occur given the constraints.
            // You might print an error or handle it as "cannot solve" in a real-world scenario.
            continue; // Skip elimination for this row if pivot is effectively zero
        }

        // Normalize the pivot row: Divide the entire pivot row by the pivot element
        // so that augmentedMatrix[k][k] becomes 1.
        for (let j = k; j < n + 1; j++) {
            augmentedMatrix[k][j] /= pivot;
        }

        // Eliminate elements below the pivot: Make all elements below augmentedMatrix[k][k] zero.
        for (let i = k + 1; i < n; i++) {
            const factor = augmentedMatrix[i][k]; // The factor to multiply the pivot row by
            for (let j = k; j < n + 1; j++) {
                augmentedMatrix[i][j] -= factor * augmentedMatrix[k][j];
            }
        }
    }

    // Back Substitution phase
    const solution: number[] = Array(n).fill(0); // This array will store the counts of each animal
    for (let i = n - 1; i >= 0; i--) { // Start from the last row and go upwards
        let sum = 0;
        // Sum up the products of known solutions (x_j) with their corresponding coefficients (A[i][j])
        for (let j = i + 1; j < n; j++) {
            sum += augmentedMatrix[i][j] * solution[j];
        }
        // Calculate the current unknown (x_i)
        // Since augmentedMatrix[i][i] is 1 (due to normalization), we simply do:
        // x_i = (B_i - sum) / A[i][i]  =>  x_i = B_i - sum
        solution[i] = augmentedMatrix[i][n] - sum;
    }

    // Print the results for each species
    for (let i = 0; i < n; i++) {
        // Animal counts must be integers, so round the floating-point results
        console.log(`${speciesOrder[i]} ${Math.round(solution[i])}`);
    }
}