/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

// Read the total number of elements in the list.
const N: number = parseInt(readline());

// Read the list of numbers (0s and 1s) and convert them to an array of numbers.
const list: number[] = readline().split(' ').map(Number);

// Step 1: Count the total number of '1's in the list.
// This count will determine how many positions at the beginning of the list
// should ideally be occupied by '1's in the final sorted state.
let numOnes: number = 0;
for (let i = 0; i < N; i++) {
    if (list[i] === 1) {
        numOnes++;
    }
}

// Step 2: Determine the minimum number of swaps.
// The goal is to have all '1's in the first 'numOnes' positions.
// We count how many '0's are currently present in these first 'numOnes' positions.
// Each such '0' is misplaced and needs to be swapped with a '1' that is
// currently in the '0's section (i.e., positions from 'numOnes' to 'N-1').
// Since each swap correctly places both a '0' and a '1', the number of swaps
// required is simply the count of these misplaced '0's.
let swaps: number = 0;
for (let i = 0; i < numOnes; i++) {
    if (list[i] === 0) {
        swaps++;
    }
}

// Step 3: Print the calculated minimum number of swaps.
console.log(swaps);