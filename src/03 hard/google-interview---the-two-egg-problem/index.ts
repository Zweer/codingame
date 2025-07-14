/**
 * Auto-generated code below aims at helping you parse the standard input
 * according to the problem statement.
 **/

const N: number = parseInt(readline());

// The problem asks for the minimal number of drops in the worst case
// to find the highest floor an egg can be dropped from without breaking,
// given N floors and two identical eggs.

// Let 'k' be the minimum number of drops required in the worst case.
// The strategy to minimize drops in the worst case involves making initial
// jumps with the first egg that decrease in size. This ensures that no
// matter when the first egg breaks, the total number of drops (including
// the sequential search with the second egg) remains constant and minimal.

// Specifically, if we aim for 'k' total drops:
// 1. Drop the first egg from floor 'k'.
//    - If it breaks: The critical floor F is in [1, k-1]. We've used 1 drop.
//      We use the second egg to test floors 1, 2, ..., k-1. This takes k-1 additional drops.
//      Total drops: 1 + (k-1) = k.
//    - If it doesn't break: F >= k. We've used 1 drop. We have k-1 drops remaining.
//      The next jump with the first egg should be (k-1) floors higher.
// 2. Drop the first egg from floor k + (k-1).
//    - If it breaks: F is in [k, k + (k-1) - 1]. We've used 2 drops.
//      We use the second egg to test floors k+1, ..., k+(k-1)-1. This takes (k-2) additional drops.
//      Total drops: 2 + (k-2) = k.
//    - If it doesn't break: F >= k + (k-1). We've used 2 drops. We have k-2 drops remaining.
//      The next jump with the first egg should be (k-2) floors higher.
// And so on, until the last jump is of size 1.

// The total number of floors that can be covered by this strategy within 'k' drops
// is the sum of the sizes of these jumps:
// Max_Floors_Covered = k + (k-1) + (k-2) + ... + 1
// This is the sum of the first 'k' natural numbers, which is given by the formula:
// Max_Floors_Covered = k * (k + 1) / 2

// We need to find the smallest integer 'k' such that Max_Floors_Covered >= N.
// So, we need to solve the inequality: k * (k + 1) / 2 >= N
// Which can be rewritten as: k^2 + k >= 2N
// Or: k^2 + k - 2N >= 0

// We use the quadratic formula to find the value of k for k^2 + k - 2N = 0:
// k = [-b ± sqrt(b^2 - 4ac)] / 2a
// For our equation (a=1, b=1, c=-2N):
// k = [-1 ± sqrt(1^2 - 4 * 1 * (-2N))] / (2 * 1)
// k = [-1 ± sqrt(1 + 8N)] / 2

// Since 'k' must be a positive number (representing drops), we take the positive root:
// k = (-1 + Math.sqrt(1 + 8N)) / 2

// Finally, since 'k' must be an integer and we need the smallest such integer
// that satisfies the inequality, we take the ceiling of the calculated value.

const discriminant: number = 1 + 8 * N;
const k_float: number = (-1 + Math.sqrt(discriminant)) / 2;
const result: number = Math.ceil(k_float);

console.log(result);