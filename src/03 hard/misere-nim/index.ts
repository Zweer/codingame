// Standard input reading boilerplate for CodinGame
// This part is usually provided or assumed.
// It uses `readline` to read input from `process.stdin`.
declare function readline(): string;

/**
 * Solves the Misere Nim puzzle for given game positions.
 */
function solveMisereNim(): void {
    // Read N (number of heaps) and K (number of positions)
    const NK_line = readline().split(' ');
    const N = parseInt(NK_line[0]); 
    const K = parseInt(NK_line[1]);

    const results: string[] = [];

    // Process each of the K game positions
    for (let k = 0; k < K; k++) {
        const Mi_line = readline().split(' ');
        const heaps = Mi_line.map(s => parseInt(s));

        // Calculate Nim-sum (xorSum) and count heaps of size 1
        let xorSum = 0;
        let numOnes = 0;
        for (const heapSize of heaps) {
            xorSum ^= heapSize;
            if (heapSize === 1) {
                numOnes++;
            }
        }
        const allHeapsAreOnes = (numOnes === N);

        const winningMoves: { heapIndex: number; amount: number }[] = [];

        // Determine if current position is an N-position (winning) or P-position (losing)
        let isWinningPosition: boolean;
        if (N === 1) { // Special case for N=1 based on example behavior
            if (heaps[0] === 1) {
                // If the only heap is [1], the current player must take it and loses.
                // Thus, [1] is a losing (P) position.
                isWinningPosition = false; 
            } else {
                // If the only heap is [M > 1], the current player can take M-1 objects, leaving [1].
                // The opponent then faces [1], which is a losing (P) position for them.
                // Thus, [M > 1] is a winning (N) position.
                isWinningPosition = true; 
            }
        } else { // General Misere Nim rules for N > 1
            if (allHeapsAreOnes) {
                // If all heaps are of size 1:
                //   P-position if even number of 1s (xorSum == 0)
                //   N-position if odd number of 1s (xorSum != 0)
                isWinningPosition = (xorSum !== 0); 
            } else {
                // If at least one heap is > 1:
                //   P-position if xorSum == 0
                //   N-position if xorSum != 0
                isWinningPosition = (xorSum !== 0); 
            }
        }

        // Output "CONCEDE" if it's a losing position
        if (!isWinningPosition) {
            results.push("CONCEDE");
        } else {
            // Find all winning moves if it's a winning position
            if (N === 1) { 
                // As per the N=1 special case, if winning, it must be [M > 1].
                // The only winning move is to take M-1 to leave [1].
                winningMoves.push({ heapIndex: 1, amount: heaps[0] - 1 });
            } else { 
                // For N > 1, apply Misere Nim winning move logic:
                // Case 1: All heaps are 1s (and N is odd, xorSum != 0, so it's an N-position)
                if (allHeapsAreOnes) {
                    // Any move is to take 1 from any heap. This leaves N-1 heaps of size 1.
                    // Since N is odd, N-1 is even, resulting in a P-position for the opponent.
                    for (let i = 0; i < N; i++) {
                        winningMoves.push({ heapIndex: i + 1, amount: 1 });
                    }
                } 
                // Case 2: At least one heap is > 1 (and xorSum != 0, so it's an N-position)
                else { 
                    // Use the same logic as finding winning moves in Normal Nim.
                    // The goal is to make the new Nim-sum (xorSum) zero.
                    for (let i = 0; i < N; i++) {
                        const currentHeapSize = heaps[i];
                        // If we take 'a' objects from heaps[i], the new size will be (currentHeapSize - a).
                        // We want (currentHeapSize - a) XOR (original_xorSum XOR currentHeapSize) = 0
                        // This implies (currentHeapSize - a) must be equal to (original_xorSum XOR currentHeapSize)
                        const targetSize = currentHeapSize ^ xorSum;
                        
                        // A valid winning move exists if the target size is smaller than the current size
                        // (meaning we remove a positive number of objects).
                        if (targetSize < currentHeapSize) { 
                            const amountToTake = currentHeapSize - targetSize;
                            winningMoves.push({ heapIndex: i + 1, amount: amountToTake });
                        }
                    }
                }
            }

            // Sort the winning moves: first by heap number, then by amount
            winningMoves.sort((a, b) => {
                if (a.heapIndex !== b.heapIndex) {
                    return a.heapIndex - b.heapIndex;
                }
                return a.amount - b.amount;
            });

            // Format the moves and add to results
            results.push(winningMoves.map(move => `${move.heapIndex}:${move.amount}`).join(' '));
        }
    }

    // Print all accumulated results
    results.forEach(result => console.log(result));
}

// Call the main function to solve the puzzle
solveMisereNim();