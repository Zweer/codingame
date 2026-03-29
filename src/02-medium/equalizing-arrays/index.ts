/**
 * Reads a line from standard input.
 * In a real CodinGame environment, this function would be provided.
 * For local testing, you might need to mock it.
 */
declare function readline(): string;

// Read N, the size of arrays A and B
const N: number = parseInt(readline());

// Read array A
const A_str: string[] = readline().split(' ');
const A: number[] = A_str.map(Number);

// Read array B
const B_str: string[] = readline().split(' ');
const B: number[] = B_str.map(Number);

// Create a mutable copy of array A to perform operations on
const currentA: number[] = [...A];

// Define the structure for an operation
interface Operation {
    P: number; // 1-based index of the source element (A[P-1])
    D: number; // Direction to increase (-1 for left, 1 for right)
    V: number; // Value to move
}

// List to store all recorded operations
const operations: Operation[] = [];

// Iterate from left to right, making currentA[i] equal to B[i]
// We iterate up to N-2 because the last element (currentA[N-1]) will automatically
// become equal to B[N-1] due to the sum(A) = sum(B) constraint.
for (let i = 0; i < N - 1; i++) {
    // If currentA[i] is not yet equal to B[i], we need to perform an operation
    if (currentA[i] !== B[i]) {
        let P: number; // Source index for the operation (1-based)
        let D: number; // Direction for the operation
        let V: number; // Value to move

        if (currentA[i] > B[i]) {
            // currentA[i] has an excess of value.
            // This excess must be moved to currentA[i+1] (to the right).
            V = currentA[i] - B[i];
            P = i + 1; // A[i] is the source (1-based index P)
            D = 1;     // Move to A[i+1]

            // Record the operation
            operations.push({ P, D, V });

            // Apply the operation to currentA
            currentA[i] -= V;     // currentA[i] becomes B[i]
            currentA[i + 1] += V; // currentA[i+1] receives the excess
        } else { // currentA[i] < B[i]
            // currentA[i] has a deficit of value.
            // This deficit must be covered by pulling value from currentA[i+1] (from the right).
            V = B[i] - currentA[i];
            P = i + 2; // A[i+1] is the source (1-based index P)
            D = -1;    // Move to A[i]

            // Record the operation
            operations.push({ P, D, V });

            // Apply the operation to currentA
            currentA[i] += V;     // currentA[i] becomes B[i]
            // Crucial assumption (guaranteed by problem constraints for this type of problem):
            // currentA[i+1] will always have enough value (i.e., currentA[i+1] >= V)
            // for the subtraction to not make it negative.
            currentA[i + 1] -= V; // currentA[i+1] provides the value
        }
    }
}

// Output the total number of operations
console.log(operations.length);

// Output each operation in the format P D V
for (const op of operations) {
    console.log(`${op.P} ${op.D} ${op.V}`);
}