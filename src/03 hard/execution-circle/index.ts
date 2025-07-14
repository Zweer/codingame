/**
 * Reads a line from standard input.
 * In a CodinGame environment, this function is usually provided.
 * For local testing, you might need to mock it or read from a file.
 */
declare function readline(): string;

// Read N and S from the first line
const [N_str, S_str] = readline().split(' ');
const N: number = parseInt(N_str);
const S: number = parseInt(S_str);

// Read D (Direction) from the second line
const D: string = readline();

// Josephus Problem variant:
// This specific problem (killer P kills P+dir, then P+2*dir kills P+3*dir, etc.)
// maps directly to the standard Josephus problem where every 2nd person is eliminated (k=2).
// The formula for the 0-indexed survivor when starting at 0, with k=2, and N people is:
// 2 * (N - 2^floor(log2(N)))

// 1. Find the largest power of 2 less than or equal to N
// Math.log2(N) gives the base-2 logarithm of N.
// Math.floor() truncates it to the largest integer power.
// 2 ** power gives 2 raised to that power.
const powerOf2LessThanOrEqualN: number = 2 ** Math.floor(Math.log2(N));

// 2. Calculate L (remainder after removing largest power of 2)
const L: number = N - powerOf2LessThanOrEqualN;

// 3. Calculate the 0-indexed survivor position in a 'standard' Josephus circle
// (starting at 0, clockwise, k=2 effectively)
const relativeSurvivor0Idx: number = 2 * L;

let finalSurvivor1Idx: number;

if (D === 'LEFT') {
    // If the direction is LEFT (clockwise), the standard Josephus formula directly applies
    // to the shifted starting position.
    // The 'relativeSurvivor0Idx' is an offset from the conceptual starting point (0-indexed).
    // To find the actual 1-indexed position in the original circle, we add the original starting point's offset (S-1)
    // and take modulo N to wrap around, then add 1 for 1-indexing.
    
    // (S - 1) converts the 1-indexed S to a 0-indexed offset from the beginning of the conceptual circle.
    finalSurvivor1Idx = ((relativeSurvivor0Idx + (S - 1)) % N) + 1;
} else { // D === 'RIGHT' (counter-clockwise)
    // If the direction is RIGHT, we can transform the problem into a LEFT-direction problem
    // by mirroring the circle.
    // A person at position P in the original circle (1-indexed) maps to N - P + 1
    // in the mirrored circle.
    
    // 1. Map the original starting point S to its mirrored equivalent S_prime.
    const S_prime: number = N - S + 1;
    
    // 2. Calculate the survivor position in this *mirrored* circle (1-indexed),
    // using the same logic as for the LEFT direction.
    const survivorInMirroredCircle1Idx: number = ((relativeSurvivor0Idx + (S_prime - 1)) % N) + 1;
    
    // 3. Map this survivor position back to the original circle.
    finalSurvivor1Idx = N - survivorInMirroredCircle1Idx + 1;
}

// Output the result
console.log(finalSurvivor1Idx);