// Read N (number of variables)
const N: number = parseInt(readline());

// Read N space-separated variables. They are given in lexicographical order.
const variables: string[] = readline().split(' ');

// Read M (number of equations)
const M: number = parseInt(readline());

// Data structure to store parsed equations: variableName -> { func, args }
type EquationRHS = {
    func: string;
    args: string[];
};
const equationMap: Map<string, EquationRHS> = new Map();

// Parse M equations
for (let i = 0; i < M; i++) {
    const equationLine = readline();
    // Example format: "z = f ( x y )"
    const parts = equationLine.split(' = ');
    const lhs = parts[0].trim(); // Left Hand Side variable (e.g., "z")
    const rhs = parts[1].trim(); // Right Hand Side expression (e.g., "f ( x y )")

    // Extract function name. It's the part before " ("
    const funcNameEndIndex = rhs.indexOf(' (');
    const funcName = rhs.substring(0, funcNameEndIndex); // e.g., "f"

    // Extract arguments string: remove "funcName (" from start and " )" from end
    const argsStr = rhs.substring(funcNameEndIndex + 2, rhs.length - 2); // e.g., "x y"
    // Split arguments string by space and filter out any empty strings (e.g., from double spaces or trailing space)
    const args = argsStr.split(' ').filter(s => s.length > 0); // e.g., ["x", "y"]
    
    equationMap.set(lhs, { func: funcName, args: args });
}

// Global state for the recursive resolver function
const solutionMap: Map<string, string> = new Map(); // Cache for resolved variable expressions (memoization)
const resolvingPath: Set<string> = new Set();       // Tracks variables currently in the recursion stack (for cycle detection)
let hasCircularReference: boolean = false;          // Flag set to true if a circular reference is found

/**
 * Recursively resolves the symbolic expression for a given variable.
 * Utilizes memoization (solutionMap) and cycle detection (resolvingPath).
 * 
 * @param variableName The name of the variable to resolve.
 * @returns The resolved expression string. If a circular reference is detected,
 *          it sets the global `hasCircularReference` flag and returns an empty string.
 */
function resolve(variableName: string): string {
    // If a circular reference has already been detected elsewhere, immediately propagate the error state.
    if (hasCircularReference) {
        return ""; 
    }

    // 1. Memoization/Cache: If the variable's solution is already computed, return it.
    if (solutionMap.has(variableName)) {
        return solutionMap.get(variableName)!;
    }

    // 2. Cycle Detection: If this variable is already in the current resolution path, we've found a cycle.
    if (resolvingPath.has(variableName)) {
        hasCircularReference = true; // Mark that a circular reference exists.
        return ""; // Return an empty string to indicate an error state in this branch.
    }

    // Add the current variable to the path to track its dependencies.
    resolvingPath.add(variableName);

    let finalExpression: string;

    // 3. Base Case: If the variable is not defined by any equation (i.e., it's an independent variable),
    // its solution is simply itself (e.g., 'x' resolves to 'x').
    if (!equationMap.has(variableName)) {
        finalExpression = variableName;
    } else {
        // 4. Recursive Step: Resolve the variable's equation.
        const equation = equationMap.get(variableName)!;
        const funcName = equation.func;
        const originalArgs = equation.args;

        const resolvedArgs: string[] = [];
        for (const arg of originalArgs) {
            const resolvedArg = resolve(arg);
            // If any recursive call detected a cycle, stop and propagate the error.
            if (hasCircularReference) {
                return ""; 
            }
            resolvedArgs.push(resolvedArg);
        }

        // Construct the simplified expression string based on the function name and resolved arguments.
        // Constraints state functions always have 1 to N arguments, so `resolvedArgs` will not be empty.
        finalExpression = `${funcName} ( ${resolvedArgs.join(' ')} )`;
    }

    // Store the computed solution in the cache for future use.
    solutionMap.set(variableName, finalExpression);
    // Remove the variable from the resolution path as its resolution is complete.
    resolvingPath.delete(variableName);

    return finalExpression;
}

// Start the resolution process for each declared variable.
// We iterate through 'variables' array to maintain the lexicographical order for output.
for (const varName of variables) {
    resolve(varName);
    // If a circular reference is detected at any point, stop processing immediately.
    if (hasCircularReference) {
        break;
    }
}

// Output the final results based on whether a circular reference was found.
if (hasCircularReference) {
    console.log("No solution!");
} else {
    // Output solutions in lexicographical order (which is the order of 'variables' array).
    for (const varName of variables) {
        // Use the non-null assertion operator (!) because we are sure it's in solutionMap
        // (either resolved or was a base case variable).
        console.log(`${varName} -> ${solutionMap.get(varName)!}`);
    }
}