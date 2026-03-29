// Helper function for Greatest Common Divisor
function gcd(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
        [a, b] = [b, a % b];
    }
    return a;
}

// Helper function for GCD of three numbers
function gcdTriple(a: number, b: number, c: number): number {
    // The problem states 'a' and 'b' can't be null at the same time,
    // which implies (a,b,c) will never be (0,0,0) and commonDivisor will be non-zero.
    return gcd(a, gcd(b, c));
}

// Read input from stdin. In CodinGame environment, readline() is globally available.
// For local testing, you might need to mock or provide a readline function.
declare function readline(): string;
declare function print(message: any): void; // Or console.log for TS environments

const inputs: number[] = readline().split(' ').map(Number);
const xA: number = inputs[0];
const yA: number = inputs[1];
const xB: number = inputs[2];
const yB: number = inputs[3];

const n: number = parseInt(readline());

// Use a Set to store unique normalized lines.
// Each line is represented as a string "a,b,c" after normalization.
const uniqueLines: Set<string> = new Set<string>();

for (let i = 0; i < n; i++) {
    const lineCoeffs: number[] = readline().split(' ').map(Number);
    let a: number = lineCoeffs[0];
    let b: number = lineCoeffs[1];
    let c: number = lineCoeffs[2];

    // Normalize the line coefficients:
    // 1. Find the GCD of |a|, |b|, |c|.
    const commonDivisor: number = gcdTriple(a, b, c);

    a /= commonDivisor;
    b /= commonDivisor;
    c /= commonDivisor;

    // 2. Ensure the first non-zero coefficient is positive for unique representation.
    //    If 'a' is negative, or if 'a' is zero and 'b' is negative,
    //    multiply all coefficients by -1.
    if (a < 0 || (a === 0 && b < 0)) {
        a = -a;
        b = -b;
        c = -c;
    }

    // Add the normalized line to the set.
    uniqueLines.add(`${a},${b},${c}`);
}

// Convert the set of unique lines back to an array of number arrays for easier processing.
const finalLines: [number, number, number][] = Array.from(uniqueLines).map(lineStr => {
    return lineStr.split(',').map(Number) as [number, number, number];
});

// Function to check if a point (x, y) lies on a line (a, b, c)
function isOnLine(x: number, y: number, line: [number, number, number]): boolean {
    const [a, b, c] = line;
    // Since input values (coordinates and coefficients) are integers,
    // the result of a*x + b*y + c will be an exact integer.
    // Therefore, a strict equality check to 0 is appropriate.
    return a * x + b * y + c === 0;
}

// Check if A or B is on any line
let aIsOnLine: boolean = false;
let bIsOnLine: boolean = false;

for (const line of finalLines) {
    if (isOnLine(xA, yA, line)) {
        aIsOnLine = true;
    }
    if (isOnLine(xB, yB, line)) {
        bIsOnLine = true;
    }
    // Optimization: if both are found to be on lines, no need to check further
    if (aIsOnLine && bIsOnLine) {
        break;
    }
}

if (aIsOnLine || bIsOnLine) {
    print("ON A LINE");
} else {
    // Neither A nor B is on a line, determine their colors.
    // The "color" of a point is determined by the parity of the number of lines
    // for which the expression `ax + by + c` is positive.
    function getColorParity(x: number, y: number, lines: [number, number, number][]): number {
        let positiveSideCount: number = 0;
        for (const line of lines) {
            const [a, b, c] = line;
            if (a * x + b * y + c > 0) {
                positiveSideCount++;
            }
        }
        return positiveSideCount % 2;
    }

    const parityA: number = getColorParity(xA, yA, finalLines);
    const parityB: number = getColorParity(xB, yB, finalLines);

    if (parityA === parityB) {
        print("YES");
    } else {
        print("NO");
    }
}