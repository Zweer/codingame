const n: number = +readline(); // Read N, the number of temperatures

if (!n) { // If N is 0 (or falsy, but here it's specifically 0)
    console.log(0);
} else {
    // Read the temperatures line, split into strings, map to numbers
    const temps: number[] = readline().split(' ').map(Number);

    // Use reduce to find the closest temperature based on rules
    const closestTemp: number = temps.reduce((a, b) => {
        const absA = Math.abs(a);
        const absB = Math.abs(b);

        // If b is strictly closer to zero than a, choose b
        if (absB < absA) {
            return b;
        } 
        // If b and a are equally close to zero, and b is positive while a is negative (or b is just greater), choose b
        else if (absB === absA && b > a) {
            return b;
        } 
        // Otherwise, a remains the closest
        else {
            return a;
        }
    });

    console.log(closestTemp);
}