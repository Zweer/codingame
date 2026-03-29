/**
 * Reads a line from standard input.
 * In a CodinGame environment, this function is usually provided.
 */
declare function readline(): string;

// Read the complex number string (e.g., "4.5+0i", "0.0-1.0i")
const cStr: string = readline();
// Read the maximum number of iterations
const m: number = parseInt(readline());

// Parse the complex number c = x + yi
let c_real: number;
let c_imag: number;

// Regex to parse "x+yi" or "x-yi" format.
// Group 1: Real part (e.g., "4.5", "-0.5") - handles optional negative sign and decimal.
// Group 2: Imaginary part with its sign (e.g., "+0", "-1.0") - handles the sign before the number and decimal.
// The 'i' at the end is matched literally.
const match = cStr.match(/(-?\d+\.?\d*)([+-]\d+\.?\d*)i/);

if (match && match.length === 3) {
    c_real = parseFloat(match[1]);
    c_imag = parseFloat(match[2]);
} else {
    // Fallback or error handling for invalid input format.
    // Based on CodinGame constraints, input format is guaranteed.
    c_real = 0.0;
    c_imag = 0.0;
    // console.error("Error: Could not parse complex number string:", cStr);
    // return; // Or throw an error
}

// Initialize z = f(0) = 0 + 0i
let z_real: number = 0.0;
let z_imag: number = 0.0;

// This variable will store the final number of iterations.
let iterations: number = 0;

// Iterate from 1 up to m
for (let i = 1; i <= m; i++) {
    // Store current z values for the calculation of the next z.
    // This is f(n-1) in the formula f(n) = f(n-1)^2 + c
    const prev_z_real = z_real;
    const prev_z_imag = z_imag;

    // Calculate the real part of f(n) = f(n-1)^2 + c
    // (a + bi)^2 = a^2 - b^2 + 2abi
    // So, real part of (f(n-1))^2 is (prev_z_real * prev_z_real - prev_z_imag * prev_z_imag)
    // Add c_real: next_z_real = (prev_z_real * prev_z_real - prev_z_imag * prev_z_imag) + c_real
    z_real = prev_z_real * prev_z_real - prev_z_imag * prev_z_imag + c_real;

    // Calculate the imaginary part of f(n) = f(n-1)^2 + c
    // Imaginary part of (f(n-1))^2 is (2 * prev_z_real * prev_z_imag)
    // Add c_imag: next_z_imag = (2 * prev_z_real * prev_z_imag) + c_imag
    z_imag = 2 * prev_z_real * prev_z_imag + c_imag;

    // Check for divergence: if |z| > 2, which is equivalent to |z|^2 > 4
    const magnitude_squared = z_real * z_real + z_imag * z_imag;

    if (magnitude_squared > 4) {
        // Divergence detected. This point is not in the Mandelbrot set.
        // The number of iterations needed to determine this is 'i'.
        iterations = i;
        break; // Exit the loop
    }

    // If the loop completes without breaking, it means the point did not diverge
    // within 'm' iterations. The 'iterations' variable will be updated to 'i'
    // in each step, so if the loop finishes normally, 'iterations' will be 'm'.
    iterations = i;
}

// Output the number of iterations
console.log(iterations);