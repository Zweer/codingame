// Required for CodinGame environment
declare function readline(): string;
declare function print(message: any): void;

/**
 * Checks if a number is prime.
 * @param num The number to check.
 * @returns True if the number is prime, false otherwise.
 */
function isPrime(num: number): boolean {
    // Numbers less than or equal to 1 are not prime.
    if (num <= 1) {
        return false;
    }
    // 2 is the only even prime number.
    if (num === 2) {
        return true;
    }
    // All other even numbers are not prime.
    if (num % 2 === 0) {
        return false;
    }
    // Check for odd divisors from 3 up to the square root of num.
    // We only need to check up to sqrt(num) because if a number n has a divisor d > sqrt(n),
    // then it must also have a divisor n/d < sqrt(n).
    for (let i = 3; i * i <= num; i += 2) {
        if (num % i === 0) {
            return false;
        }
    }
    return true;
}

/**
 * Main function to solve the puzzle.
 */
function solve() {
    // Read R and C from the first line
    const RC_line = readline().split(' ').map(Number);
    const R = RC_line[0];
    const C = RC_line[1];

    // Read the grid of single-digit numbers
    const grid: number[][] = [];
    for (let i = 0; i < R; i++) {
        grid.push(readline().split(' ').map(Number));
    }

    // Use a Set to store distinct prime numbers found
    const foundPrimes = new Set<number>();

    // --- Search for primes across (horizontally) ---
    // Iterate through each row
    for (let r = 0; r < R; r++) {
        // Iterate through each starting column for a potential number
        for (let c = 0; c < C; c++) {
            let currentNumStr = ""; // String to build the current number
            // Extend the number to the right
            for (let k = c; k < C; k++) {
                currentNumStr += grid[r][k].toString();
                const num = parseInt(currentNumStr);
                // Check if the formed number is prime and add to set if it is
                if (isPrime(num)) {
                    foundPrimes.add(num);
                }
            }
        }
    }

    // --- Search for primes down (vertically) ---
    // Iterate through each column
    for (let c = 0; c < C; c++) {
        // Iterate through each starting row for a potential number
        for (let r = 0; r < R; r++) {
            let currentNumStr = ""; // String to build the current number
            // Extend the number downwards
            for (let k = r; k < R; k++) {
                currentNumStr += grid[k][c].toString();
                const num = parseInt(currentNumStr);
                // Check if the formed number is prime and add to set if it is
                if (isPrime(num)) {
                    foundPrimes.add(num);
                }
            }
        }
    }

    // Print the total count of distinct primes found
    print(foundPrimes.size);
}

// Call the main solve function to execute the logic
solve();