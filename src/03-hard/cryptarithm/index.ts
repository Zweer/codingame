// Standard input reading in CodinGame
declare function readline(): string;
declare function print(message: any): void;

function solveCryptarithm() {
    const N: number = parseInt(readline());
    const addendWords: string[] = [];
    for (let i = 0; i < N; i++) {
        addendWords.push(readline());
    }
    const totalWord: string = readline();

    // Collect all unique letters
    const uniqueLetters = new Set<string>();
    // Keep track of letters that cannot be assigned to 0 (first letter of any word)
    const firstLettersCannotBeZero = new Set<string>();

    // Populate uniqueLetters and firstLettersCannotBeZero
    addendWords.forEach(word => {
        firstLettersCannotBeZero.add(word[0]);
        for (const char of word) {
            uniqueLetters.add(char);
        }
    });
    firstLettersCannotBeZero.add(totalWord[0]);
    for (const char of totalWord) {
        uniqueLetters.add(char);
    }

    // Convert Set to Array and sort alphabetically for consistent backtracking order and output
    const sortedLetters = Array.from(uniqueLetters).sort();
    
    // Calculate coefficients for each letter in the equation
    // Equation form: sum(addend_word_values) - total_word_value = 0
    // This translates to: sum(coeff_L * value_L) = 0
    const coefficients = new Map<string, number>();
    for (const letter of sortedLetters) {
        coefficients.set(letter, 0); // Initialize all coefficients to 0
    }

    // Add coefficients for addend words
    addendWords.forEach(word => {
        let powerOfTen = 1; // Represents 10^0, 10^1, 10^2, ...
        // Iterate from right to left (least significant digit to most significant)
        for (let i = word.length - 1; i >= 0; i--) {
            const char = word[i];
            // Add the current place value to the letter's coefficient
            coefficients.set(char, coefficients.get(char)! + powerOfTen);
            powerOfTen *= 10;
        }
    });

    // Subtract coefficients for the total word
    let powerOfTen = 1;
    for (let i = totalWord.length - 1; i >= 0; i--) {
        const char = totalWord[i];
        // Subtract the current place value from the letter's coefficient
        coefficients.set(char, coefficients.get(char)! - powerOfTen);
        powerOfTen *= 10;
    }

    // Map to store letter to digit assignments during backtracking
    const assignedDigits = new Map<string, number>();
    // Array to track which digits (0-9) have already been used
    const usedDigits = new Array<boolean>(10).fill(false);
    
    // Flag to stop search once the single solution is found (optimization)
    let solutionFound = false;

    // Backtracking function
    // k: current index in sortedLetters array being processed
    function backtrack(k: number): boolean {
        // Base case: All letters have been assigned digits
        if (k === sortedLetters.length) {
            // Check if the equation sum equals zero with the current assignments
            let sum = 0;
            for (const [letter, coeff] of coefficients) {
                sum += coeff * assignedDigits.get(letter)!;
            }
            if (sum === 0) {
                solutionFound = true; // Mark solution found
                return true; // This path leads to a solution
            }
            return false; // This path does not lead to a solution
        }

        const currentLetter = sortedLetters[k];

        // Try assigning each digit (0-9) to the current letter
        for (let digit = 0; digit <= 9; digit++) {
            // Pruning: Check constraints
            if (usedDigits[digit]) {
                continue; // Digit already assigned to another letter
            }
            if (digit === 0 && firstLettersCannotBeZero.has(currentLetter)) {
                continue; // First letter of a word cannot be 0
            }

            // Assign the digit and mark it as used
            assignedDigits.set(currentLetter, digit);
            usedDigits[digit] = true;

            // Recurse for the next letter
            if (backtrack(k + 1)) {
                return true; // If a solution is found in the recursive call, propagate true
            }

            // Backtrack: If the recursive call didn't find a solution, unassign and unmark
            usedDigits[digit] = false;
            assignedDigits.delete(currentLetter);
        }
        return false; // No digit worked for the current letter from this point
    }

    // Start the backtracking process from the first letter (index 0)
    backtrack(0);

    // Output the solution in alphabetical order of letters
    sortedLetters.forEach(letter => {
        print(`${letter} ${assignedDigits.get(letter)}`);
    });
}

// Call the function to run the puzzle solver
solveCryptarithm();