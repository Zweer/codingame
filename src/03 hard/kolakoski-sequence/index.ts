// Read N (number of digits to output)
const N: number = parseInt(readline());

// Read A and B (the two distinct digits for the sequence)
const inputs: string[] = readline().split(' ');
const A: number = parseInt(inputs[0]);
const B: number = parseInt(inputs[1]);

// kolakoskiSequence will store the generated sequence.
// Its elements are the digits A and B, and also determine the run lengths.
const kolakoskiSequence: number[] = [];

// readPointer: Index pointing to the element in kolakoskiSequence
// that determines the current run length.
let readPointer: number = 0;

// Initialize the sequence with its first elements (A and B).
// For the standard Kolakoski sequence, the first two elements
// of the sequence itself become the first two run lengths.
// E.g., for A=1, B=2, K[0]=1, K[1]=2.
kolakoskiSequence.push(A);
// Only add B if N is greater than 1, as a sequence of length 1 would just be [A].
if (N > 1) {
    kolakoskiSequence.push(B);
}

// Generate the sequence until it reaches N elements.
// The readPointer will advance through kolakoskiSequence, using its elements as run lengths.
while (kolakoskiSequence.length < N) {
    // Get the run length from the sequence itself at the current readPointer's position.
    const runLength: number = kolakoskiSequence[readPointer];

    // Determine the digit to append for this run.
    // The digits alternate: A for runs determined by even-indexed elements of kolakoskiSequence,
    // and B for runs determined by odd-indexed elements.
    // This correctly models that the first block is of A's, the second of B's, etc.
    const digitToAppend: number = (readPointer % 2 === 0) ? A : B;

    // Append 'digitToAppend' 'runLength' times to the sequence.
    for (let i = 0; i < runLength; i++) {
        // Only append if the sequence length has not yet reached N.
        if (kolakoskiSequence.length < N) {
            kolakoskiSequence.push(digitToAppend);
        } else {
            // If adding this element would exceed N, stop appending for this run
            // and exit the inner loop. The outer loop will then check the main condition.
            break;
        }
    }

    // Move the readPointer to the next element in the sequence,
    // as it will define the length of the next run.
    readPointer++;
}

// Output the first N elements of the generated sequence, without any separators.
// Use slice(0, N) to ensure exactly N elements are output. This handles cases
// where the last iteration of the inner loop might have added more elements
// than strictly needed to reach N before the outer loop condition was checked.
console.log(kolakoskiSequence.slice(0, N).join(''));