// Define readline and print functions for the CodinGame environment
declare function readline(): string;
declare function print(message: any): void;

/**
 * Converts a Balanced Ternary string to its decimal integer equivalent.
 *
 * @param bt The Balanced Ternary string (e.g., "1T01T").
 * @returns The decimal integer value.
 */
function balancedTernaryToDecimal(bt: string): number {
    let decimalValue = 0;
    let powerOfThree = 1; // Represents 3^0, then 3^1, 3^2, and so on.

    // Iterate through the balanced ternary string from right to left
    // (from the least significant digit to the most significant digit)
    for (let i = bt.length - 1; i >= 0; i--) {
        const digit = bt[i];
        if (digit === '1') {
            decimalValue += powerOfThree;
        } else if (digit === 'T') {
            decimalValue -= powerOfThree; // 'T' represents -1 in Balanced Ternary
        }
        // If the digit is '0', its contribution is 0 * powerOfThree, so decimalValue remains unchanged.

        // Move to the next power of three for the next digit position
        powerOfThree *= 3;
    }

    return decimalValue;
}

/**
 * Converts a decimal integer to its Balanced Ternary string representation.
 *
 * @param n The decimal integer.
 * @returns The Balanced Ternary string (e.g., "1T01T").
 */
function decimalToBalancedTernary(n: number): string {
    if (n === 0) {
        return "0";
    }

    const isNegative = n < 0;
    // For conversion, work with the absolute value of the number
    n = Math.abs(n);

    const resultDigits: string[] = [];
    let tempN = n;

    // Core conversion loop for positive numbers based on remainders when dividing by 3
    while (tempN > 0) {
        const remainder = tempN % 3;
        if (remainder === 0) {
            resultDigits.push('0');
            tempN /= 3; // Equivalent to (tempN - 0) / 3
        } else if (remainder === 1) {
            resultDigits.push('1');
            tempN = (tempN - 1) / 3;
        } else { // remainder === 2. In Balanced Ternary, this is handled as -1 ('T') with a carry of +1
            resultDigits.push('T'); // 'T' represents -1
            tempN = (tempN + 1) / 3; // This addition effectively handles the carry-over
        }
        // Ensure tempN remains an integer after division, truncating any fractional part towards zero.
        tempN = Math.trunc(tempN);
    }

    // The digits were collected in reverse order (least significant first), so reverse them and join
    let balancedTernary = resultDigits.reverse().join('');

    // If the original number was negative, invert each non-zero digit in the balanced ternary string
    if (isNegative) {
        balancedTernary = balancedTernary.split('').map(digit => {
            if (digit === '1') return 'T'; // +1 becomes -1
            if (digit === 'T') return '1'; // -1 becomes +1
            return '0'; // 0 remains 0 when negated
        }).join('');
    }

    return balancedTernary;
}

// Read input lines from standard input
const lhsString: string = readline();
const op: string = readline();
const rhsString: string = readline();

// Convert Balanced Ternary operands to their decimal integer equivalents
const lhsDecimal: number = balancedTernaryToDecimal(lhsString);
const rhsDecimal: number = balancedTernaryToDecimal(rhsString);

let resultDecimal: number;

// Perform the arithmetic operation based on the operator
switch (op) {
    case '+':
        resultDecimal = lhsDecimal + rhsDecimal;
        break;
    case '-':
        resultDecimal = lhsDecimal - rhsDecimal;
        break;
    case '*':
        resultDecimal = lhsDecimal * rhsDecimal;
        break;
    case '<<':
        // Left shift by 'rhsDecimal' positions is equivalent to multiplying by 3 raised to the power of 'rhsDecimal'.
        // Math.trunc is used to ensure the result is an integer, discarding any fractional part.
        resultDecimal = Math.trunc(lhsDecimal * Math.pow(3, rhsDecimal));
        break;
    case '>>':
        // Right shift by 'rhsDecimal' positions is equivalent to dividing by 3 raised to the power of 'rhsDecimal'.
        // Math.trunc is used to ensure the result is an integer, discarding any fractional part.
        resultDecimal = Math.trunc(lhsDecimal / Math.pow(3, rhsDecimal));
        break;
    default:
        // This case should not be reached based on the problem constraints for 'op'.
        throw new Error("Unknown operator: " + op);
}

// Convert the final decimal result back to Balanced Ternary string format
const resultBalancedTernary: string = decimalToBalancedTernary(resultDecimal);

// Print the final result to standard output
print(resultBalancedTernary);