/**
 * Interface to represent a sphere with its coordinates and radius.
 * 'r' will store the current radius, which might be expanded.
 * 'originalR' stores the initial radius to ensure the sphere only expands or stays the same size.
 */
interface Sphere {
    x: number;
    y: number;
    z: number;
    r: number;
    originalR: number;
}

/**
 * Calculates the Euclidean distance between the centers of two spheres.
 * @param s1 The first sphere.
 * @param s2 The second sphere.
 * @returns The distance between their centers.
 */
function calculateDistance(s1: Sphere, s2: Sphere): number {
    const dx = s1.x - s2.x;
    const dy = s1.y - s2.y;
    const dz = s1.z - s2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Read the number of spheres
const N: number = parseInt(readline());

// Array to store all sphere objects.
// We'll modify the 'r' property in place.
const spheres: Sphere[] = [];

// Read sphere data for N spheres
for (let i = 0; i < N; i++) {
    const inputs: number[] = readline().split(' ').map(Number);
    const x = inputs[0];
    const y = inputs[1];
    const z = inputs[2];
    const r = inputs[3];
    spheres.push({ x, y, z, r, originalR: r }); // Store both current and original radius
}

// Process each sphere in the given order
for (let i = 0; i < N; i++) {
    const currentSphere = spheres[i];
    let minRequiredRadius = Infinity;

    // Iterate through all other spheres to find the closest one
    // and determine the minimum radius currentSphere needs to expand to.
    for (let j = 0; j < N; j++) {
        if (i === j) {
            continue; // A sphere cannot touch itself
        }

        const otherSphere = spheres[j];

        // Calculate the distance between the centers of the two spheres
        const distanceBetweenCenters = calculateDistance(currentSphere, otherSphere);

        // Get the current radius of the other sphere.
        // If otherSphere (j) was processed earlier (j < i), its 'r' is already its expanded radius.
        // If otherSphere (j) is yet to be processed (j > i), its 'r' is still its original radius.
        const otherSphereCurrentRadius = otherSphere.r;

        // Calculate the radius 'currentSphere' would need to have to touch 'otherSphere'.
        // This is (distance between centers) - (other sphere's current radius).
        const candidateRadius = distanceBetweenCenters - otherSphereCurrentRadius;

        // Update minRequiredRadius with the smallest candidate found so far.
        minRequiredRadius = Math.min(minRequiredRadius, candidateRadius);
    }

    // The sphere's new radius must be at least its original radius,
    // and also sufficient to touch the nearest other sphere.
    // Use Math.max to ensure the radius only expands or stays the same.
    currentSphere.r = Math.max(currentSphere.originalR, minRequiredRadius);
}

// Calculate the sum of r^3 for all spheres after expansion
let sumOfCubes = 0;
for (let i = 0; i < N; i++) {
    sumOfCubes += Math.pow(spheres[i].r, 3);
}

// Round the final sum to the nearest integer and print the result
print(Math.round(sumOfCubes));