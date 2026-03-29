// Define an interface for clarity, though a type alias or anonymous object would also work.
interface Horse {
    V: number; // Velocity
    E: number; // Elegance
}

// Read the number of horses from the first line of input.
const N: number = parseInt(readline());

// Create an array to store the strength vectors of all horses.
const horses: Horse[] = [];

// Loop N times to read the V and E values for each horse.
for (let i = 0; i < N; i++) {
    // Read the line, split it by space to get V and E as strings.
    const inputs = readline().split(' ');
    // Parse the strings to numbers.
    const V: number = parseInt(inputs[0]);
    const E: number = parseInt(inputs[1]);
    // Add the horse's strength to the array.
    horses.push({ V, E });
}

// Initialize minDistance to the largest possible safe integer.
// Any calculated distance will be smaller than this, ensuring it gets updated.
let minDistance: number = Number.MAX_SAFE_INTEGER;

// Iterate through all possible unique pairs of horses.
// The outer loop picks the first horse in a pair.
for (let i = 0; i < N; i++) {
    // The inner loop picks the second horse in a pair.
    // It starts from i + 1 to avoid comparing a horse with itself and to avoid duplicate pairs (e.g., (A, B) and (B, A)).
    for (let j = i + 1; j < N; j++) {
        const horse1 = horses[i];
        const horse2 = horses[j];

        // Calculate the Manhattan distance between the two horses.
        // abs(V2 - V1) + abs(E2 - E1)
        const distance = Math.abs(horse2.V - horse1.V) + Math.abs(horse2.E - horse1.E);
        
        // If the calculated distance is smaller than the current minimum, update minDistance.
        if (distance < minDistance) {
            minDistance = distance;
        }
    }
}

// Print the smallest distance found.
print(minDistance);