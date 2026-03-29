// Function to implement the FizzBuzzer logic
function fizzBuzzer(n: number): string {
    // ... implementation as described above ...
}

// Map to store pre-computed results: string -> smallest_integer
const deFizzBuzzMap = new Map<string, number>();

// Pre-computation loop
for (let i = 1; i <= 1000; i++) {
    const outputString = fizzBuzzer(i);
    // Store only if not already present, ensuring smallest integer is mapped
    if (!deFizzBuzzMap.has(outputString)) {
        deFizzBuzzMap.set(outputString, i);
    }
}

// Read N queries
const N: number = parseInt(readline());

// Process each query
for (let i = 0; i < N; i++) {
    const queryStr: string = readline();
    if (deFizzBuzzMap.has(queryStr)) {
        console.log(deFizzBuzzMap.get(queryStr));
    } else {
        console.log('ERROR');
    }
}