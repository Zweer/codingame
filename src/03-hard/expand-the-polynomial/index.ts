// Define a Polynomial class to handle coefficients and operations
type Coefficients = Map<number, number>; // Exponent -> Coefficient

class Polynomial {
    coefficients: Coefficients;

    constructor(coefficients?: Coefficients) {
        // Initialize coefficients map. Use new Map() if not provided.
        this.coefficients = coefficients || new Map<number, number>();
        this.normalize(); // Clean up zero coefficients after initialization
    }

    // Static factory method for a constant polynomial (e.g., 5)
    static fromConstant(value: number): Polynomial {
        const poly = new Polynomial();
        if (value !== 0) { // Only add non-zero constants
            poly.coefficients.set(0, value);
        }
        return poly;
    }

    // Static factory method for x^N (e.g., x, x^2)
    static fromX(exponent: number = 1): Polynomial {
        const poly = new Polynomial();
        poly.coefficients.set(exponent, 1);
        return poly;
    }

    // Adds two polynomials term by term
    add(other: Polynomial): Polynomial {
        const newCoeffs = new Map(this.coefficients); // Start with coefficients of 'this'
        for (const [exp, coeff] of other.coefficients.entries()) {
            // Add 'other' polynomial's coefficients to 'newCoeffs'
            newCoeffs.set(exp, (newCoeffs.get(exp) || 0) + coeff);
        }
        return new Polynomial(newCoeffs); // Return a new Polynomial instance
    }

    // Multiplies two polynomials
    multiply(other: Polynomial): Polynomial {
        const newCoeffs = new Map<number, number>();
        for (const [exp1, coeff1] of this.coefficients.entries()) {
            for (const [exp2, coeff2] of other.coefficients.entries()) {
                const newExp = exp1 + exp2; // Add exponents during multiplication
                const newCoeff = coeff1 * coeff2; // Multiply coefficients
                // Sum up coefficients for the same new exponent
                newCoeffs.set(newExp, (newCoeffs.get(newExp) || 0) + newCoeff);
            }
        }
        return new Polynomial(newCoeffs); // Return a new Polynomial instance
    }

    // Raises the polynomial to a power N (P(x)^N) using binary exponentiation
    power(n: number): Polynomial {
        // Exponent must be a non-negative integer
        if (n < 0 || !Number.isInteger(n)) {
            throw new Error("Exponent must be a non-negative integer.");
        }
        if (n === 0) return Polynomial.fromConstant(1); // Any non-zero poly to power 0 is 1
        if (n === 1) return this; // Power of 1 is the polynomial itself

        let result = Polynomial.fromConstant(1); // Initialize result as 1
        let base = this; // The base polynomial

        // Binary exponentiation (exponentiation by squaring)
        while (n > 0) {
            if (n % 2 === 1) { // If exponent is odd, multiply result by current base
                result = result.multiply(base);
            }
            base = base.multiply(base); // Square the base
            n = Math.floor(n / 2); // Halve the exponent
        }
        return result;
    }

    // Removes zero coefficients (e.g., 0x^2)
    normalize(): void {
        for (const [exp, coeff] of this.coefficients.entries()) {
            if (coeff === 0) {
                this.coefficients.delete(exp); // Remove entry if coefficient is zero
            }
        }
    }

    // Converts the polynomial to its standard string representation
    toString(): string {
        this.normalize(); // Ensure no zero terms before formatting

        const terms: string[] = [];
        // Get all exponents and sort them in decreasing order
        const sortedExponents = Array.from(this.coefficients.keys()).sort((a, b) => b - a);

        // If the polynomial simplifies to 0 (no terms left after normalization)
        if (sortedExponents.length === 0) {
            return "0";
        }

        for (const exp of sortedExponents) {
            const coeff = this.coefficients.get(exp);
            if (coeff === 0) continue; // Skip zero coefficients

            let termStr = "";
            const isNegative = coeff < 0;
            const absCoeff = Math.abs(coeff);

            if (exp === 0) { // Constant term (x^0)
                termStr = String(absCoeff);
            } else if (exp === 1) { // x term (x^1)
                termStr = (absCoeff === 1) ? "x" : `${absCoeff}x`;
            } else { // x^N term (N > 1)
                termStr = (absCoeff === 1) ? `x^${exp}` : `${absCoeff}x^${exp}`;
            }

            // Determine prefix (+ or -)
            if (terms.length === 0) { // First term in the string
                if (isNegative) {
                    terms.push(`-${termStr}`);
                } else {
                    terms.push(termStr);
                }
            } else { // Subsequent terms
                if (isNegative) {
                    terms.push(` - ${termStr}`);
                } else {
                    terms.push(` + ${termStr}`);
                }
            }
        }

        return terms.join("");
    }
}

/**
 * Expands a polynomial expression.
 * @param input The polynomial expression string (e.g., "(x-1)*(x+2)").
 * @returns The expanded polynomial in standard form (e.g., "x^2+x-2").
 */
function expandPolynomial(input: string): string {
    // Remove all whitespace from the input string for simpler parsing
    input = input.replace(/\s/g, '');

    // Current position in the input string, managed by the parser functions
    let pos = 0;

    // Helper function to advance the current position
    function consume(count: number): void {
        pos += count;
    }

    // Helper function to peek at the character at the current position without advancing
    function peek(): string | undefined {
        return input[pos];
    }

    // Helper function to check if we've reached the end of the input string
    function isEOF(): boolean {
        return pos >= input.length;
    }

    // Parses a number (used for coefficients and exponents)
    function parseNumber(): number {
        const start = pos;
        while (pos < input.length && /[0-9]/.test(input[pos])) {
            pos++;
        }
        if (pos === start) { // No digits found where a number was expected
            throw new Error(`Expected a number at position ${pos}`);
        }
        return parseInt(input.substring(start, pos), 10);
    }

    // Parses a "factor" which is the basic unit for multiplication and exponentiation.
    // A factor can be:
    // - A parenthesized expression, possibly raised to a power: `(x+1)^2`
    // - A variable term: `x`, `x^2`, `5x`, `-3x^4`
    // - A numeric constant: `5`, `-10`
    function parseFactor(): Polynomial {
        let basePoly: Polynomial;
        let sign = 1; // Tracks leading sign for the factor

        // Handle leading sign of the factor (e.g., - (x+1), -5x)
        if (peek() === '-') {
            sign = -1;
            consume(1);
        } else if (peek() === '+') {
            consume(1); // Ignore explicit positive sign
        }

        if (peek() === '(') {
            // If it's a parenthesized expression, parse its content recursively
            consume(1); // Consume '('
            basePoly = parseExpression(); // Recursively parse the content inside parentheses
            if (peek() !== ')') {
                throw new Error(`Mismatched parentheses. Expected ')' at position ${pos}`);
            }
            consume(1); // Consume ')'
            // Apply the leading sign to the entire polynomial parsed from within parentheses
            basePoly = basePoly.multiply(Polynomial.fromConstant(sign));
        } else {
            // Otherwise, it must be an atomic term (number, x, x^N, Cx, Cx^N)
            let coeff = 1; // Default coefficient is 1
            let exponent = 0; // Default exponent for constants is 0

            const numStart = pos;
            let isNumericStart = false;

            // Check if the term starts with a digit (potential numeric coefficient or constant)
            if (/[0-9]/.test(input[pos])) {
                isNumericStart = true;
                coeff = parseNumber(); // Parse the leading number
            }

            if (peek() === 'x') { // If 'x' follows (e.g., 'x', '3x', 'x^2', '5x^3')
                consume(1); // Consume 'x'
                exponent = 1; // Default exponent for 'x' if not explicitly specified
                if (peek() === '^') { // Check for an explicit exponent (e.g., 'x^2')
                    consume(1); // Consume '^'
                    exponent = parseNumber(); // Parse the exponent number
                }
                // Create a polynomial term with the determined coefficient and exponent
                basePoly = new Polynomial(new Map([[exponent, sign * coeff]]));
            } else if (isNumericStart) { // If it was just a number (a constant term, e.g., '5', '-10')
                basePoly = Polynomial.fromConstant(sign * coeff);
            } else {
                // If neither '(' nor a valid term start found, it's an unexpected token
                throw new Error(`Unexpected token for factor at position ${pos}: '${input.substring(pos, pos + 10)}...'`);
            }
        }

        // After parsing the base of the factor, check for exponentiation (e.g., `(x+1)^2`)
        if (peek() === '^') {
            consume(1); // Consume '^'
            const exponentValue = parseNumber(); // Parse the exponent
            if (exponentValue < 0 || !Number.isInteger(exponentValue)) {
                throw new Error(`Polynomial exponent must be a non-negative integer. Found invalid exponent at position ${pos}`);
            }
            basePoly = basePoly.power(exponentValue); // Apply the exponentiation
        }

        return basePoly;
    }

    // Parses a "term" which is a sequence of factors multiplied together.
    // Examples: `(x-1)*(x+2)`, `x^2*x`
    function parseTerm(): Polynomial {
        let result = parseFactor(); // Start with the first factor
        while (peek() === '*') { // While there's a multiplication operator
            consume(1); // Consume '*'
            const nextFactor = parseFactor(); // Parse the next factor
            result = result.multiply(nextFactor); // Multiply the current result by the new factor
        }
        return result;
    }

    // Parses an "expression" which is a sequence of terms added or subtracted.
    // This is the highest level of precedence.
    // Examples: `x^2+x-2`, `(x-1)+(x+2)`
    function parseExpression(): Polynomial {
        let result = parseTerm(); // Start with the first term
        while (peek() === '+' || peek() === '-') { // While there's an addition or subtraction operator
            const operator = peek();
            consume(1); // Consume '+' or '-'
            const nextTerm = parseTerm(); // Parse the next term
            if (operator === '+') {
                result = result.add(nextTerm); // Add the term
            } else { // operator === '-'
                // Subtracting a term is equivalent to adding it multiplied by -1
                result = result.add(nextTerm.multiply(Polynomial.fromConstant(-1)));
            }
        }
        return result;
    }

    // Start the parsing process from the top-level expression
    const expandedPoly = parseExpression();

    // After parsing, ensure that all input characters have been consumed.
    // If not, there are unexpected tokens remaining in the input string.
    if (!isEOF()) {
        throw new Error(`Unexpected tokens after parsing: '${input.substring(pos)}' at position ${pos}`);
    }

    // Return the string representation of the expanded polynomial
    return expandedPoly.toString();
}