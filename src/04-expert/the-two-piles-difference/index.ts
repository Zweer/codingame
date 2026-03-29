import * as readline from 'readline';

// Function to read input from stdin
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let inputLines: string[] = [];

// Event listener for each line of input
rl.on('line', (line: string) => {
    inputLines.push(line);
});

// Event listener for end of input
rl.on('close', () => {
    solve();
});

function solve() {
    const N: number = parseInt(inputLines[0]);
    const nums: number[] = inputLines[1].split(' ').map(Number);

    // Count frequencies of each number
    const counts = new Map<number, number>();
    for (const num of nums) {
        counts.set(num, (counts.get(num) || 0) + 1);
    }

    // Sort unique values to process them in a consistent order
    const uniqueValues = Array.from(counts.keys()).sort((a, b) => a - b);

    // Scale factor for log2 values to keep them as integers
    const SCALE_FACTOR = 100;

    // Max scaled log2 product for B.
    // If all N/2 elements in B are 20, then max log2 product is (N/2) * log2(20).
    // For N=40, N/2=20: 20 * log2(20) * 100 approx 8643.85.
    // We use a value slightly above this as a threshold for products that are "too large".
    // Values equal to or greater than this sentinel will be treated as very large numbers.
    const CAPPED_PROD_SENTINEL = Math.ceil((N / 2) * (Math.log2(20) * SCALE_FACTOR)) + 1;

    // DP table: Map<number, Map<number, Set<number>>>
    // dp[numA][sumA] = Set of scaled_log_prod_B values
    // Initial state: 0 elements in A, sum 0 for A, product 1 for B (log_prod 0)
    let currentDp = new Map<number, Map<number, Set<number>>>();
    currentDp.set(0, new Map<number, Set<number>>().set(0, new Set([0])));

    // Helper to calculate scaled log2
    const getScaledLog2 = (val: number): number => {
        if (val === 1) return 0; // log2(1) is 0
        return Math.round(Math.log2(val) * SCALE_FACTOR);
    };

    // Iterate through each unique value present in the input numbers
    for (const val of uniqueValues) {
        const count = counts.get(val)!;
        const scaledLogVal = getScaledLog2(val);

        // tempDp holds the states for the current unique value 'val'
        // It starts with all states from currentDp (representing not taking any of 'val' initially)
        let tempDp = new Map<number, Map<number, Set<number>>>();
        for (const [numAKey, sumAMap] of currentDp.entries()) {
            tempDp.set(numAKey, new Map<number, Set<number>>());
            for (const [sumAKey, scaledLogProdBSet] of sumAMap.entries()) {
                tempDp.get(numAKey)!.set(sumAKey, new Set(scaledLogProdBSet));
            }
        }

        let remainingCount = count;
        let batchSize = 1;

        // Multi-item knapsack optimization: process 'val' in batches of powers of 2
        // Example: if count = 13, process in batches of 1, 2, 4, then remaining 6.
        while (remainingCount > 0) {
            const currentBatchCount = Math.min(batchSize, remainingCount);
            remainingCount -= currentBatchCount;

            // Create a list of states from tempDp that need to be processed in this batch iteration
            // We iterate over a copy because tempDp will be modified within the loop by adding new states.
            const statesToProcess: [number, number, number][] = [];
            for (const [prevNumA, sumAMap] of tempDp.entries()) {
                for (const [prevSumA, scaledLogProdBSet] of sumAMap.entries()) {
                    for (const prevScaledLogProdB of scaledLogProdBSet) {
                        statesToProcess.push([prevNumA, prevSumA, prevScaledLogProdB]);
                    }
                }
            }

            // For each state processed in this batch
            for (const [prevNumA, prevSumA, prevScaledLogProdB] of statesToProcess) {
                // Option 1: Put currentBatchCount of 'val' into list A
                const newNumA_A = prevNumA + currentBatchCount;
                const newSumA_A = prevSumA + currentBatchCount * val;
                const newScaledLogProdB_A = prevScaledLogProdB; // B's product does not change with this batch

                // Ensure A doesn't exceed N/2 elements
                if (newNumA_A <= N / 2) { 
                    if (!tempDp.has(newNumA_A)) {
                        tempDp.set(newNumA_A, new Map<number, Set<number>>());
                    }
                    if (!tempDp.get(newNumA_A)!.has(newSumA_A)) {
                        tempDp.get(newNumA_A)!.set(newSumA_A, new Set());
                    }
                    tempDp.get(newNumA_A)!.get(newSumA_A)!.add(newScaledLogProdB_A);
                }

                // Option 2: Put currentBatchCount of 'val' into list B
                const newNumA_B = prevNumA; // A's count and sum do not change with this batch
                const newSumA_B = prevSumA;
                const newScaledLogProdB_B = prevScaledLogProdB + currentBatchCount * scaledLogVal;
                
                // Cap products that are too large to be relevant.
                // Any product that causes scaled_log_prod_B to exceed CAPPED_PROD_SENTINEL
                // will be treated as a very large number, unlikely to yield a minimal difference.
                const finalScaledLogProdB_B = Math.min(newScaledLogProdB_B, CAPPED_PROD_SENTINEL); 

                if (!tempDp.has(newNumA_B)) {
                    tempDp.set(newNumA_B, new Map<number, Set<number>>());
                }
                if (!tempDp.get(newNumA_B)!.has(newSumA_B)) {
                    tempDp.get(newNumA_B)!.set(newSumA_B, new Set());
                }
                tempDp.get(newNumA_B)!.get(newSumA_B)!.add(finalScaledLogProdB_B);
            }
            batchSize *= 2; // Double batch size for next iteration (power of 2)
        }
        currentDp = tempDp; // Update dp for next unique value
    }

    let minDiff = Infinity;

    // After processing all unique values, find the minimum difference
    const targetNumA = N / 2;
    if (currentDp.has(targetNumA)) {
        const sumAMap = currentDp.get(targetNumA)!;
        for (const [sumA, scaledLogProdsB] of sumAMap.entries()) {
            const squaredSumA = sumA * sumA;
            for (const scaledLogProdB of scaledLogProdsB) {
                let prodB: number;
                // If the scaled log product reached or exceeded the sentinel,
                // it implies a very large product. Treat it as Infinity for difference calculation.
                if (scaledLogProdB >= CAPPED_PROD_SENTINEL) {
                    prodB = Infinity; 
                } else {
                    // Convert scaled log2 product back to actual product
                    prodB = Math.round(Math.pow(2, scaledLogProdB / SCALE_FACTOR));
                }
                minDiff = Math.min(minDiff, Math.abs(squaredSumA - prodB));
            }
        }
    }
    
    console.log(minDiff);
}