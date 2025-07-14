import * as readline from 'readline';

// Setup readline interface for input/output
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let inputLines: string[] = [];

// Collect all input lines
rl.on('line', (line: string) => {
    inputLines.push(line);
});

// Process input once all lines are read
rl.on('close', () => {
    // Parse E (number of elements in starting line), L (target line), N (target element index)
    const [E, L, N] = inputLines[0].split(' ').map(Number);
    
    // Parse the starting line elements into a string array
    // This will be our current line, which represents Line 1 of the trapezoid.
    let currentLine: string[] = inputLines[1].split(' ');

    /**
     * Determines if a string can be strictly interpreted as a number.
     * According to the puzzle rules, an empty string or strings containing only whitespace
     * are not considered numbers for the purpose of summation vs. concatenation,
     * even though `Number("")` returns 0.
     * @param s The string to check.
     * @returns True if the string represents a valid number, false otherwise.
     */
    function isNumberString(s: string): boolean {
        // If the string is empty or just whitespace after trimming, it's not a number for our purpose.
        if (s.trim() === "") {
            return false;
        }
        // Otherwise, check if it can be converted to a number without resulting in NaN.
        return !isNaN(Number(s));
    }

    /**
     * Combines two elements based on the Pascal Trapezoid rules.
     * - If both input elements can be interpreted as a number, then they are summed.
     * - If either input element cannot be interpreted as a number, then the inputs are concatenated.
     *   Element `a` (n-1) remains before element `b` (n) in the concatenation.
     * @param a The first element string (representing `prevLineElement[n-1]`).
     * @param b The second element string (representing `prevLineElement[n]`).
     * @returns The combined element as a string.
     */
    function combineElements(a: string, b: string): string {
        const isAStrictNum = isNumberString(a);
        const isBStrictNum = isNumberString(b);

        if (isAStrictNum && isBStrictNum) {
            // Both elements are numbers, sum them and return as a string.
            return (Number(a) + Number(b)).toString();
        } else {
            // At least one element is not a number, concatenate them.
            return a + b;
        }
    }

    // Simulate the trapezoid generation from Line 1 up to Line L.
    // The loop runs L-1 times because we already have Line 1.
    for (let currentLineNum = 1; currentLineNum < L; currentLineNum++) {
        const nextLine: string[] = [];
        
        // --- Calculate the first element of the next line ---
        // This element is formed by combining an implied element (prevLineElement[n-1])
        // with the first element of the current line (prevLineElement[0]).
        // The implied element is "0" if currentLine[0] is numeric, otherwise it's "".
        const impliedLeft = isNumberString(currentLine[0]) ? "0" : "";
        nextLine.push(combineElements(impliedLeft, currentLine[0]));

        // --- Calculate the middle elements of the next line ---
        // These elements are formed by combining adjacent elements from the current line.
        // For a current line of length K, there are K-1 such middle elements.
        for (let i = 0; i < currentLine.length - 1; i++) {
            nextLine.push(combineElements(currentLine[i], currentLine[i+1]));
        }

        // --- Calculate the last element of the next line ---
        // This element is formed by combining the last element of the current line
        // with an implied element (prevLineElement[nMax+1]).
        // The implied element is "0" if currentLine[last] is numeric, otherwise it's "".
        const impliedRight = isNumberString(currentLine[currentLine.length - 1]) ? "0" : "";
        nextLine.push(combineElements(currentLine[currentLine.length - 1], impliedRight));

        // The newly generated `nextLine` becomes the `currentLine` for the next iteration.
        currentLine = nextLine;
    }

    // After the loop, `currentLine` holds the elements of the L-th line.
    // The problem asks for the N-th element, and N is 1-indexed, so we access index N-1.
    console.log(currentLine[N - 1]);
});