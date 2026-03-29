// Utility for Greatest Common Divisor (GCD)
function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
}

/**
 * Represents a fraction with numerator and denominator.
 * Fractions are always simplified and keep the sign on the numerator.
 */
class Fraction {
    num: number;
    den: number;

    constructor(num: number, den: number) {
        if (den === 0) {
            throw new Error("Denominator cannot be zero.");
        }
        // Ensure sign is on the numerator
        if (den < 0) {
            num = -num;
            den = -den;
        }
        this.num = num;
        this.den = den;
        this.simplify();
    }

    /** Simplifies the fraction by dividing by the GCD of numerator and denominator. */
    private simplify(): void {
        const commonDivisor = gcd(Math.abs(this.num), this.den);
        this.num /= commonDivisor;
        this.den /= commonDivisor;
    }

    /** Adds two fractions. */
    add(other: Fraction): Fraction {
        return new Fraction(
            this.num * other.den + other.num * this.den,
            this.den * other.den
        );
    }

    /** Subtracts another fraction from this one. */
    subtract(other: Fraction): Fraction {
        return new Fraction(
            this.num * other.den - other.num * this.den,
            this.den * other.den
        );
    }

    /** Multiplies two fractions. */
    multiply(other: Fraction): Fraction {
        return new Fraction(this.num * other.num, this.den * other.den);
    }

    /** Divides this fraction by another. Throws if dividing by zero. */
    divide(other: Fraction): Fraction {
        if (other.isZero()) {
            throw new Error("Division by zero fraction.");
        }
        return new Fraction(this.num * other.den, this.den * other.num);
    }

    /** Checks if two fractions are equal. */
    equals(other: Fraction): boolean {
        return this.num === other.num && this.den === other.den;
    }

    /** Checks if the fraction is 0/1. */
    isZero(): boolean {
        return this.num === 0;
    }

    /** Checks if the fraction is 1/1. */
    isOne(): boolean {
        return this.num === this.den && this.num !== 0; // num !== 0 to distinguish from 0/0 (which is not 1)
    }

    /** Checks if the fraction represents a valid probability (between 0 and 1, inclusive). */
    isValidProb(): boolean {
        return this.num >= 0 && this.num <= this.den;
    }

    /** Returns the string representation of the fraction (e.g., "1/2"). */
    toString(): string {
        return `${this.num}/${this.den}`;
    }
}

// Global map to store known probabilities
const probValues = new Map<string, Fraction>();

// Flag to indicate if a contradiction is found
let isImpossible = false;

/**
 * Attempts to set a probability value. Handles validation and consistency checks.
 * @param key The string key for the probability (e.g., "A", "A AND B").
 * @param value The calculated Fraction value.
 * @returns true if a new value was successfully set, false if the value was already known and consistent.
 * @throws Error "IMPOSSIBLE" if the value is invalid or contradictory.
 */
function setProb(key: string, value: Fraction): boolean {
    if (isImpossible) return false; // Stop processing if already impossible

    if (!value.isValidProb()) {
        isImpossible = true;
        throw new Error("IMPOSSIBLE");
    }

    if (probValues.has(key)) {
        if (!probValues.get(key)!.equals(value)) {
            isImpossible = true;
            throw new Error("IMPOSSIBLE"); // Contradiction: same probability has two different values
        }
        return false; // Value already exists and is consistent
    } else {
        probValues.set(key, value);
        return true; // New value set
    }
}

/**
 * Attempts to calculate a specific probability based on known values and rules.
 * @param targetKey The probability key to calculate.
 * @returns A Fraction if successfully calculated, null otherwise.
 */
function calculateTargetProb(targetKey: string): Fraction | null {
    const getP = (key: string): Fraction | undefined => probValues.get(key);
    const ONE = new Fraction(1, 1);

    // This switch-case covers all ways to derive each of the 16 probabilities.
    // Order of checks inside each case doesn't strictly matter due to iterative solver,
    // but a logical order might slightly improve early convergence.
    switch (targetKey) {
        case "A":
            if (getP("NOT A")) return ONE.subtract(getP("NOT A")!);
            if (getP("A AND B") && getP("A AND NOT B")) return getP("A AND B")!.add(getP("A AND NOT B")!);
            break;
        case "B":
            if (getP("NOT B")) return ONE.subtract(getP("NOT B")!);
            if (getP("A AND B") && getP("NOT A AND B")) return getP("A AND B")!.add(getP("NOT A AND B")!);
            break;
        case "NOT A":
            if (getP("A")) return ONE.subtract(getP("A")!);
            if (getP("NOT A AND B") && getP("NOT A AND NOT B")) return getP("NOT A AND B")!.add(getP("NOT A AND NOT B")!);
            break;
        case "NOT B":
            if (getP("B")) return ONE.subtract(getP("B")!);
            if (getP("A AND NOT B") && getP("NOT A AND NOT B")) return getP("A AND NOT B")!.add(getP("NOT A AND NOT B")!);
            break;

        case "A AND B":
            if (getP("A GIVEN B") && getP("B")) return getP("A GIVEN B")!.multiply(getP("B")!);
            if (getP("B GIVEN A") && getP("A")) return getP("B GIVEN A")!.multiply(getP("A")!);
            if (getP("A") && getP("A AND NOT B")) return getP("A")!.subtract(getP("A AND NOT B")!);
            if (getP("B") && getP("NOT A AND B")) return getP("B")!.subtract(getP("NOT A AND B")!);
            // 1 - (A AND NOT B + NOT A AND B + NOT A AND NOT B)
            if (getP("A AND NOT B") && getP("NOT A AND B") && getP("NOT A AND NOT B")) {
                let sum = getP("A AND NOT B")!.add(getP("NOT A AND B")!).add(getP("NOT A AND NOT B")!);
                return ONE.subtract(sum);
            }
            break;
        case "A AND NOT B":
            if (getP("A GIVEN NOT B") && getP("NOT B")) return getP("A GIVEN NOT B")!.multiply(getP("NOT B")!);
            if (getP("NOT B GIVEN A") && getP("A")) return getP("NOT B GIVEN A")!.multiply(getP("A")!);
            if (getP("A") && getP("A AND B")) return getP("A")!.subtract(getP("A AND B")!);
            if (getP("NOT B") && getP("NOT A AND NOT B")) return getP("NOT B")!.subtract(getP("NOT A AND NOT B")!);
            // 1 - (A AND B + NOT A AND B + NOT A AND NOT B)
            if (getP("A AND B") && getP("NOT A AND B") && getP("NOT A AND NOT B")) {
                let sum = getP("A AND B")!.add(getP("NOT A AND B")!).add(getP("NOT A AND NOT B")!);
                return ONE.subtract(sum);
            }
            break;
        case "NOT A AND B":
            if (getP("NOT A GIVEN B") && getP("B")) return getP("NOT A GIVEN B")!.multiply(getP("B")!);
            if (getP("B GIVEN NOT A") && getP("NOT A")) return getP("B GIVEN NOT A")!.multiply(getP("NOT A")!);
            if (getP("B") && getP("A AND B")) return getP("B")!.subtract(getP("A AND B")!);
            if (getP("NOT A") && getP("NOT A AND NOT B")) return getP("NOT A")!.subtract(getP("NOT A AND NOT B")!);
            // 1 - (A AND B + A AND NOT B + NOT A AND NOT B)
            if (getP("A AND B") && getP("A AND NOT B") && getP("NOT A AND NOT B")) {
                let sum = getP("A AND B")!.add(getP("A AND NOT B")!).add(getP("NOT A AND NOT B")!);
                return ONE.subtract(sum);
            }
            break;
        case "NOT A AND NOT B":
            if (getP("NOT A GIVEN NOT B") && getP("NOT B")) return getP("NOT A GIVEN NOT B")!.multiply(getP("NOT B")!);
            if (getP("NOT B GIVEN NOT A") && getP("NOT A")) return getP("NOT B GIVEN NOT A")!.multiply(getP("NOT A")!);
            if (getP("NOT A") && getP("NOT A AND B")) return getP("NOT A")!.subtract(getP("NOT A AND B")!);
            if (getP("NOT B") && getP("A AND NOT B")) return getP("NOT B")!.subtract(getP("A AND NOT B")!);
            // 1 - (A AND B + A AND NOT B + NOT A AND B)
            if (getP("A AND B") && getP("A AND NOT B") && getP("NOT A AND B")) {
                let sum = getP("A AND B")!.add(getP("A AND NOT B")!).add(getP("NOT A AND B")!);
                return ONE.subtract(sum);
            }
            break;

        case "A GIVEN B":
            if (getP("A AND B") && getP("B") && !getP("B")!.isZero()) return getP("A AND B")!.divide(getP("B")!);
            if (getP("NOT A GIVEN B") && getP("B") && !getP("B")!.isZero()) return ONE.subtract(getP("NOT A GIVEN B")!);
            break;
        case "A GIVEN NOT B":
            if (getP("A AND NOT B") && getP("NOT B") && !getP("NOT B")!.isZero()) return getP("A AND NOT B")!.divide(getP("NOT B")!);
            if (getP("NOT A GIVEN NOT B") && getP("NOT B") && !getP("NOT B")!.isZero()) return ONE.subtract(getP("NOT A GIVEN NOT B")!);
            break;
        case "B GIVEN A":
            if (getP("A AND B") && getP("A") && !getP("A")!.isZero()) return getP("A AND B")!.divide(getP("A")!);
            if (getP("NOT B GIVEN A") && getP("A") && !getP("A")!.isZero()) return ONE.subtract(getP("NOT B GIVEN A")!);
            break;
        case "B GIVEN NOT A":
            if (getP("NOT A AND B") && getP("NOT A") && !getP("NOT A")!.isZero()) return getP("NOT A AND B")!.divide(getP("NOT A")!);
            if (getP("NOT B GIVEN NOT A") && getP("NOT A") && !getP("NOT A")!.isZero()) return ONE.subtract(getP("NOT B GIVEN NOT A")!);
            break;

        case "NOT A GIVEN B":
            if (getP("NOT A AND B") && getP("B") && !getP("B")!.isZero()) return getP("NOT A AND B")!.divide(getP("B")!);
            if (getP("A GIVEN B") && getP("B") && !getP("B")!.isZero()) return ONE.subtract(getP("A GIVEN B")!);
            break;
        case "NOT A GIVEN NOT B":
            if (getP("NOT A AND NOT B") && getP("NOT B") && !getP("NOT B")!.isZero()) return getP("NOT A AND NOT B")!.divide(getP("NOT B")!);
            if (getP("A GIVEN NOT B") && getP("NOT B") && !getP("NOT B")!.isZero()) return ONE.subtract(getP("A GIVEN NOT B")!);
            break;
        case "NOT B GIVEN A":
            if (getP("A AND NOT B") && getP("A") && !getP("A")!.isZero()) return getP("A AND NOT B")!.divide(getP("A")!);
            if (getP("B GIVEN A") && getP("A") && !getP("A")!.isZero()) return ONE.subtract(getP("B GIVEN A")!);
            break;
        case "NOT B GIVEN NOT A":
            if (getP("NOT A AND NOT B") && getP("NOT A") && !getP("NOT A")!.isZero()) return getP("NOT A AND NOT B")!.divide(getP("NOT A")!);
            if (getP("B GIVEN NOT A") && getP("NOT A") && !getP("NOT A")!.isZero()) return ONE.subtract(getP("B GIVEN NOT A")!);
            break;
    }
    return null; // Cannot calculate this probability
}

/**
 * Performs one iteration of calculation, attempting to derive all unknown probabilities.
 * @returns true if any new probabilities were set in this iteration, false otherwise.
 */
function calculateOneIteration(): boolean {
    let changed = false;
    // Iterate through all possible probability keys to try and calculate them
    for (const key of ALL_PROBABILITIES_KEYS) {
        if (!probValues.has(key)) { // Only try to calculate if not already known
            const calculatedValue = calculateTargetProb(key);
            if (calculatedValue) {
                if (setProb(key, calculatedValue)) { // Set the value and check if it's new
                    changed = true;
                }
            }
        }
        if (isImpossible) return false; // Stop if contradiction found
    }
    return changed;
}

// All probability keys in lexicographical order for output
const ALL_PROBABILITIES_KEYS = [
    "A",
    "A AND B",
    "A AND NOT B",
    "A GIVEN B",
    "A GIVEN NOT B",
    "B",
    "B GIVEN A",
    "B GIVEN NOT A",
    "NOT A",
    "NOT A AND B",
    "NOT A AND NOT B",
    "NOT A GIVEN B",
    "NOT A GIVEN NOT B",
    "NOT B",
    "NOT B GIVEN A",
    "NOT B GIVEN NOT A",
];

// Main execution block for CodinGame
try {
    // Read the three input probabilities
    for (let i = 0; i < 3; i++) {
        const line = readline();
        const parts = line.split(" = ");
        const key = parts[0];
        const [numStr, denStr] = parts[1].split("/");
        const value = new Fraction(parseInt(numStr), parseInt(denStr));
        setProb(key, value);
    }

    // Fixed-point iteration: keep calculating as long as new values are found
    let changedInLastIteration = true;
    while (changedInLastIteration && !isImpossible) {
        changedInLastIteration = calculateOneIteration();
    }

    // Output results
    if (isImpossible) {
        print("IMPOSSIBLE");
    } else {
        for (const key of ALL_PROBABILITIES_KEYS) {
            if (probValues.has(key)) {
                print(`${key} = ${probValues.get(key)!.toString()}`);
            }
        }
    }

} catch (e: any) {
    // Catch any explicit "IMPOSSIBLE" errors or unexpected errors
    if (e.message === "IMPOSSIBLE" || isImpossible) {
        print("IMPOSSIBLE");
    } else {
        // For debugging other unexpected errors
        // console.error(e);
        // print("ERROR: " + e.message); // For local debugging
        print("IMPOSSIBLE"); // Assume other errors imply impossibility in contest context
    }
}