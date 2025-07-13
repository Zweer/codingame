/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

const N: number = parseInt(readline());

// Calculate the total number of mini-cubes in an N x N x N Rubik's Cube.
// This is simply N cubed.
const totalCubes: number = Math.pow(N, 3);

// Calculate the number of mini-cubes that are *not* visible.
// These are the cubes that form the inner core of the larger cube.
// The dimensions of this inner core are (N-2) x (N-2) x (N-2).
// If N is 1 or 2, there is no "inner core" that is completely hidden,
// so the effective dimension for the hidden core is 0.
// Math.max(0, N - 2) ensures that the dimension is never negative,
// resulting in 0 hidden cubes for N=1 and N=2.
const hiddenCoreDimension: number = Math.max(0, N - 2);
const hiddenCubes: number = Math.pow(hiddenCoreDimension, 3);

// The number of visible mini-cubes is the total number of cubes minus the hidden ones.
const visibleCubes: number = totalCubes - hiddenCubes;

// Output the result.
console.log(visibleCubes);