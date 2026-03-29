// The `readline` function is provided by the CodinGame platform.
// declare function readline(): string;

/**
 * Checks for horizontal symmetry (reflection across the middle horizontal axis).
 * U[r][c] must be equal to U[N-1-r][c].
 */
function checkHorizontalSymmetry(unitPattern: boolean[][], N: number, W: number): boolean {
    for (let r = 0; r < Math.floor(N / 2); r++) {
        for (let c = 0; c < W; c++) {
            if (unitPattern[r][c] !== unitPattern[N - 1 - r][c]) {
                return false;
            }
        }
    }
    return true;
}

/**
 * Checks for vertical symmetry (reflection across the middle vertical axis).
 * U[r][c] must be equal to U[r][W-1-c].
 */
function checkVerticalSymmetry(unitPattern: boolean[][], N: number, W: number): boolean {
    for (let r = 0; r < N; r++) {
        for (let c = 0; c < Math.floor(W / 2); c++) {
            if (unitPattern[r][c] !== unitPattern[r][W - 1 - c]) {
                return false;
            }
        }
    }
    return true;
}

/**
 * Checks for 180-degree rotation symmetry (rotation about the center point).
 * U[r][c] must be equal to U[N-1-r][W-1-c].
 */
function checkRotationSymmetry(unitPattern: boolean[][], N: number, W: number): boolean {
    for (let r = 0; r < N; r++) {
        for (let c = 0; c < W; c++) {
            if (unitPattern[r][c] !== unitPattern[N - 1 - r][W - 1 - c]) {
                return false;
            }
        }
    }
    return true;
}

/**
 * Checks for glide-reflection symmetry.
 * Reflection across the horizontal axis followed by a translation by W/2.
 * U[r][c] must be equal to U[N-1-r][(c + W/2) % W].
 * Requires W to be even.
 */
function checkGlideReflectionSymmetry(unitPattern: boolean[][], N: number, W: number): boolean {
    if (W % 2 !== 0) {
        return false; // Glide reflection is not defined for odd unit width W in this context.
    }
    const halfW = W / 2;
    for (let r = 0; r < N; r++) {
        for (let c = 0; c < W; c++) {
            if (unitPattern[r][c] !== unitPattern[N - 1 - r][(c + halfW) % W]) {
                return false;
            }
        }
    }
    return true;
}

// Read input
const N: number = parseInt(readline());
const rawPattern: string[] = [];
for (let i = 0; i < N; i++) {
    rawPattern.push(readline());
}
const M: number = rawPattern[0].length; // Width of the full pattern

// Convert to boolean[][] for easier comparison (# is true, - is false)
const pattern: boolean[][] = Array(N).fill(null).map(() => Array(M).fill(false));
for (let r = 0; r < N; r++) {
    for (let c = 0; c < M; c++) {
        pattern[r][c] = rawPattern[r][c] === '#';
    }
}

// Find the smallest repeating unit width (unitWidth)
let divisors: number[] = [];
for (let i = 1; i * i <= M; i++) {
    if (M % i === 0) {
        divisors.push(i);
        if (i * i !== M) { // Avoid adding the square root twice if M is a perfect square
            divisors.push(M / i);
        }
    }
}
divisors.sort((a, b) => a - b); // Sort divisors to check smallest first

let unitWidth = M; // Default to full width
for (const w of divisors) {
    let isPeriod = true;
    for (let r = 0; r < N; r++) {
        for (let c = 0; c < M - w; c++) { // Check if pattern[r][c] repeats every 'w' columns
            if (pattern[r][c] !== pattern[r][c + w]) {
                isPeriod = false;
                break;
            }
        }
        if (!isPeriod) break;
    }
    if (isPeriod) {
        unitWidth = w;
        break; // Found the smallest period that repeats perfectly across all rows
    }
}

// Extract the unit pattern (the first N x unitWidth sub-matrix)
const unitPattern: boolean[][] = Array(N).fill(null).map(() => Array(unitWidth).fill(false));
for (let r = 0; r < N; r++) {
    for (let c = 0; c < unitWidth; c++) {
        unitPattern[r][c] = pattern[r][c];
    }
}

// Check for symmetries on the unit pattern
const hasH = checkHorizontalSymmetry(unitPattern, N, unitWidth);
const hasV = checkVerticalSymmetry(unitPattern, N, unitWidth);
const hasR = checkRotationSymmetry(unitPattern, N, unitWidth);
const hasG = checkGlideReflectionSymmetry(unitPattern, N, unitWidth);

// Classify the frieze group based on the detected symmetries
let result: string;

// The order of checks is important to find the most specific group first.
if (hasH && hasV) {
    // pmm2: Horizontal, vertical, and rotation symmetries (H and V imply R).
    result = "pmm2";
} else if (hasV && hasR && hasG && !hasH) {
    // pma2: Vertical, rotation, and glide-reflection, but no horizontal symmetry.
    result = "pma2";
} else if (hasH) {
    // p1m1: Only horizontal symmetry.
    result = "p1m1";
} else if (hasV) {
    // pm11: Only vertical symmetries.
    result = "pm11";
} else if (hasR) {
    // p112: Only 180-degree rotation.
    result = "p112";
} else if (hasG) {
    // p1a1: Only glide-reflections.
    result = "p1a1";
} else {
    // p111: No other transformations.
    result = "p111";
}

console.log(result);