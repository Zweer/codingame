// Define readline and print functions for CodinGame environment
declare function readline(): string;
declare function print(message: any): void;

// N: The length of the sequence
const N: number = parseInt(readline());

// A: The sequence of N integers
// Split the second line by spaces and convert each part to a number
const A: number[] = readline().split(' ').map(Number);

// Initialize maxBeautifulValue to 0.
// Since element values are non-negative (0 to 10000), 0 is a safe initial value.
// Any valid beautiful value (smallest element * length) will be >= 0.
let maxBeautifulValue: number = 0;

// --- Step 1: Calculate left_smaller array ---
// leftSmaller[i] will store the index of the first element to the left of A[i]
// that is strictly smaller than A[i]. If no such element exists, it's -1.
const leftSmaller: number[] = new Array(N).fill(-1);
const stackForLeft: number[] = []; // This stack will store indices

// Iterate from left to right
for (let i = 0; i < N; i++) {
    // While the stack is not empty and the element at the top of the stack
    // is greater than or equal to the current element A[i]:
    // Pop from the stack. These elements cannot be the 'left_smaller' for A[i]
    // because A[i] is smaller or equal. Also, if they are equal, the first instance
    // to the left would be considered the true "minimum" if the goal was to identify
    // a unique minimum. But for finding the widest range where A[i] is *a* minimum,
    // we want to extend past equal values to find the first *strictly smaller* value.
    while (stackForLeft.length > 0 && A[stackForLeft[stackForLeft.length - 1]] >= A[i]) {
        stackForLeft.pop();
    }

    // If the stack is not empty after popping, the top element is the 'left_smaller' for A[i].
    if (stackForLeft.length > 0) {
        leftSmaller[i] = stackForLeft[stackForLeft.length - 1];
    }
    
    // Push the current index onto the stack.
    // The stack maintains indices of elements in non-decreasing order of their values.
    stackForLeft.push(i);
}

// --- Step 2: Calculate right_smaller array ---
// rightSmaller[i] will store the index of the first element to the right of A[i]
// that is strictly smaller than A[i]. If no such element exists, it's N (array length).
const rightSmaller: number[] = new Array(N).fill(N);
const stackForRight: number[] = []; // Reuse a new stack, or clear the old one.

// Iterate from right to left
for (let i = N - 1; i >= 0; i--) {
    // While the stack is not empty and the element at the top of the stack
    // is greater than or equal to the current element A[i]:
    // Pop from the stack. Similar logic to left_smaller, but for the right side.
    while (stackForRight.length > 0 && A[stackForRight[stackForRight.length - 1]] >= A[i]) {
        stackForRight.pop();
    }

    // If the stack is not empty after popping, the top element is the 'right_smaller' for A[i].
    if (stackForRight.length > 0) {
        rightSmaller[i] = stackForRight[stackForRight.length - 1];
    }
    
    // Push the current index onto the stack.
    // The stack maintains indices of elements in non-decreasing order of their values.
    stackForRight.push(i);
}

// --- Step 3: Calculate the maximum beautiful value ---
// For each element A[i], consider it as the smallest element of a continuous subsequence.
// The range of indices [leftBound + 1, rightBound - 1] represents the widest possible
// continuous subsequence where A[i] is the smallest element.
// The length of this subsequence is (rightBound - 1) - (leftBound + 1) + 1.
// This simplifies to rightBound - leftBound - 1.
for (let i = 0; i < N; i++) {
    const currentMinElement = A[i];
    const leftBound = leftSmaller[i];
    const rightBound = rightSmaller[i];
    
    // Calculate the length of the subsequence where A[i] is the smallest element.
    const length = rightBound - leftBound - 1;
    
    const currentBeautifulValue = currentMinElement * length;
    
    // Update the maximum beautiful value found so far
    if (currentBeautifulValue > maxBeautifulValue) {
        maxBeautifulValue = currentBeautifulValue;
    }
}

// Output the result
console.log(maxBeautifulValue);