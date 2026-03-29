import * as readline from 'readline';

// Quaternion class definition
class Quaternion {
    i: number; // Coefficient for 'i'
    j: number; // Coefficient for 'j'
    k: number; // Coefficient for 'k'
    s: number; // Scalar term (real part)

    constructor(i: number, j: number, k: number, s: number) {
        this.i = i;
        this.j = j;
        this.k = k;
        this.s = s;
    }

    /**
     * Multiplies this quaternion by another quaternion (this * other).
     * Quaternion multiplication is non-commutative.
     */
    multiply(other: Quaternion): Quaternion {
        // Let q1 = s1 + a1*i + b1*j + c1*k
        // Let q2 = s2 + a2*i + b2*j + c2*k
        const a1 = this.i, b1 = this.j, c1 = this.k, s1 = this.s;
        const a2 = other.i, b2 = other.j, c2 = other.k, s2 = other.s;

        // Formulas for (s1 + a1i + b1j + c1k) * (s2 + a2i + b2j + c2k)
        // Derived from distributive law and quaternion rules (ij=k, jk=i, ki=j, i²=j²=k²=-1)
        // and their non-commutative counterparts (ji=-k, kj=-i, ik=-j)

        // New i component (A)
        const new_i = s1 * a2 + a1 * s2 + b1 * c2 - c1 * b2; // s1*a2i + a1i*s2 + b1j*c2k (jk=i) + c1k*b2j (kj=-i)
        // New j component (B)
        const new_j = s1 * b2 + b1 * s2 + c1 * a2 - a1 * c2; // s1*b2j + b1j*s2 + c1k*a2i (ki=j) + a1i*c2k (ik=-j)
        // New k component (C)
        const new_k = s1 * c2 + c1 * s2 + a1 * b2 - b1 * a2; // s1*c2k + c1k*s2 + a1i*b2j (ij=k) + b1j*a2i (ji=-k)
        // New Scalar component (S)
        const new_s = s1 * s2 - a1 * a2 - b1 * b2 - c1 * c2; // s1*s2 + a1i*a2i (i²=-1) + b1j*b2j (j²=-1) + c1k*c2k (k²=-1)

        return new Quaternion(new_i, new_j, new_k, new_s);
    }

    /**
     * Formats the quaternion into the required string representation:
     * "a*i + b*j + c*k + d" (terms ordered i, j, k, scalar)
     * Handles coefficients of 0, 1, and -1 according to puzzle rules.
     */
    toString(): string {
        const terms: string[] = [];

        // i term
        if (this.i !== 0) {
            let iStr = '';
            if (this.i === 1) iStr = 'i';
            else if (this.i === -1) iStr = '-i';
            else iStr = `${this.i}i`;
            terms.push(iStr);
        }

        // j term
        if (this.j !== 0) {
            let jStr = '';
            if (this.j === 1) jStr = 'j';
            else if (this.j === -1) jStr = '-j';
            else jStr = `${this.j}j`;
            terms.push(jStr);
        }

        // k term
        if (this.k !== 0) {
            let kStr = '';
            if (this.k === 1) kStr = 'k';
            else if (this.k === -1) kStr = '-k';
            else kStr = `${this.k}k`;
            terms.push(kStr);
        }

        // scalar term (d)
        if (this.s !== 0) {
            terms.push(`${this.s}`);
        }

        // If all components are zero, the result is "0"
        if (terms.length === 0) {
            return '0';
        }

        // Join terms with '+' where necessary, respecting negative signs
        let result = '';
        for (let i = 0; i < terms.length; i++) {
            const term = terms[i];
            if (i === 0) {
                result += term; // The first term doesn't need a leading '+'
            } else {
                // If a term starts with '-', the '-' serves as its sign.
                // Otherwise, it's a positive term, so prepend a '+'.
                if (term.startsWith('-')) {
                    result += term;
                } else {
                    result += '+' + term;
                }
            }
        }
        return result;
    }
}

/**
 * Parses a string representation of a single simplified quaternion (e.g., "2i+2j-2", "j+1", "k", "5").
 */
function parseQuaternionString(qStr: string): Quaternion {
    let i = 0, j = 0, k = 0, s = 0;

    // Trim whitespace and ensure a leading sign for consistent parsing
    // E.g., "2i+2j-2" becomes "+2i+2j-2"
    qStr = qStr.trim();
    if (qStr.length > 0 && qStr[0] !== '+' && qStr[0] !== '-') {
        qStr = '+' + qStr;
    }

    // Regex to extract individual terms:
    // Group 1: sign (+ or -)
    // Group 2: optional coefficient (e.g., "2", "1", or empty string for 'i', '-j')
    // Group 3: optional unit (i, j, k, or undefined for scalar terms)
    const termRegex = /([+-])(\d*)?([ijk])?/g;
    let match: RegExpExecArray | null;

    while ((match = termRegex.exec(qStr)) !== null) {
        const sign = match[1] === '-' ? -1 : 1; // Determine if term is positive or negative
        const coeffStr = match[2];              // The string representation of the coefficient
        const unit = match[3];                  // The unit (i, j, k) or undefined for scalar

        let coeff: number;
        // If no number is explicitly provided (e.g., "i", "-j", "k"), the coefficient is 1.
        if (coeffStr === undefined || coeffStr === '') {
            coeff = 1;
        } else {
            coeff = parseInt(coeffStr, 10);
        }

        coeff *= sign; // Apply the determined sign to the coefficient

        // Add the coefficient to the corresponding quaternion component
        if (unit === 'i') {
            i += coeff;
        } else if (unit === 'j') {
            j += coeff;
        } else if (unit === 'k') {
            k += coeff;
        } else {
            // If no unit is present, it's a scalar term
            s += coeff;
        }
    }

    return new Quaternion(i, j, k, s);
}

// Set up readline interface for input/output
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (line: string) => {
    const expr = line;

    // Extract all bracketed quaternion expressions from the input string.
    // Example: "(2i+2j)(j+1)" will result in ["(2i+2j)", "(j+1)"]
    const bracketedQuaternions = expr.match(/\((.*?)\)/g);

    // According to constraints, input will always be a product of bracketed expressions.
    // However, a safety check for empty input or no matches is good practice.
    if (!bracketedQuaternions || bracketedQuaternions.length === 0) {
        console.log("0"); // Output 0 if no valid quaternions are found
        rl.close();
        return;
    }

    // Initialize the result with the multiplicative identity (1 + 0i + 0j + 0k)
    let resultQuaternion = new Quaternion(0, 0, 0, 1);

    // Multiply each quaternion in sequence to get the final product
    for (const qStrBracketed of bracketedQuaternions) {
        // Remove the outer parentheses to get the inner quaternion string (e.g., "2i+2j")
        const qStr = qStrBracketed.substring(1, qStrBracketed.length - 1);
        const nextQuaternion = parseQuaternionString(qStr);
        resultQuaternion = resultQuaternion.multiply(nextQuaternion);
    }

    // Output the final simplified quaternion in the required format
    console.log(resultQuaternion.toString());

    rl.close();
});