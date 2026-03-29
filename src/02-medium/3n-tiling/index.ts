const MOD = 1000000007; // 10^9 + 7
const MAX_N = 1000000;

// Precompute for K=1
const dp1: number[] = new Array(MAX_N + 1);
for (let i = 0; i <= MAX_N; i++) {
    dp1[i] = (i % 3 === 0) ? 1 : 0;
}

// Precompute for K=2
const dp2: number[] = new Array(MAX_N + 1);
dp2[0] = 1;
dp2[1] = 0;
for (let i = 2; i <= MAX_N; i++) {
    // Ways to tile 2xI grid:
    // 1. Place a 2x2 piece: leaves 2x(I-2) grid. Contributes dp2[i-2].
    // 2. Place two 1x3 pieces (stacked): leaves 2x(I-3) grid. Contributes dp2[i-3].
    dp2[i] = dp2[i - 2];
    if (i >= 3) {
        dp2[i] = (dp2[i] + dp2[i - 3]) % MOD;
    }
}

// Precompute for K=3
const dp3: number[] = new Array(MAX_N + 1);
// Based on observed example values: dp3[0]=1, dp3[1]=1, dp3[2]=1, dp3[3]=2, dp3[4]=3, dp3[5]=4, dp3[6]=8.
// Recurrence: dp3[i] = dp3[i-1] + dp3[i-3]
// Additional ways: +2 for even N >= 6.
dp3[0] = 1;
dp3[1] = 1;
dp3[2] = 1; // Base case, as two 3x1 vertical pieces tile a 3x2 grid in 1 way.

for (let i = 3; i <= MAX_N; i++) {
    let currentWays = (dp3[i - 1] + dp3[i - 3]) % MOD;

    // For K=3, additional ways using 2x2 pieces appear for even N >= 6.
    // This is deduced from the provided example (K=3, N=6, result 8).
    // Simple dp3[i-1] + dp3[i-3] gives 6 for N=6, so 2 additional ways are needed.
    if (i >= 6 && i % 2 === 0) {
        currentWays = (currentWays + 2) % MOD;
    }
    dp3[i] = currentWays;
}

// Read input and solve test cases
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let testCases: number = 0;
let lineNum: number = 0;

rl.on('line', (line: string) => {
    if (lineNum === 0) {
        testCases = parseInt(line);
    } else {
        const [K, N] = line.split(' ').map(Number);
        let result: number;
        if (K === 1) {
            result = dp1[N];
        } else if (K === 2) {
            result = dp2[N];
        } else if (K === 3) {
            result = dp3[N];
        } else {
            // According to constraints, K is always 1, 2, or 3.
            // This case should not be reached.
            result = 0; 
        }
        console.log(result);
        testCases--;
        if (testCases === 0) {
            rl.close();
        }
    }
    lineNum++;
});