/**
 * Reads a line from standard input.
 * In a CodinGame environment, this function is usually provided globally.
 */
declare function readline(): string;

function solve() {
    // Read the input integer N
    const N: number = parseInt(readline());

    // --- Calculate Minimum Surface Area ---
    // Initialize minSurface to a very large number
    let minSurface: number = Infinity;

    // Iterate through possible values for 'l' (length)
    // 'l' must be a factor of N. To minimize surface area, l, w, h should be close.
    // We enforce l <= w <= h to systematically find all unique dimension sets
    // and avoid redundant calculations due to permutation.
    // 'l' can go up to N^(1/3) because if l > N^(1/3), then l*l*l > N,
    // which would mean w or h (which are >= l) would violate l*w*h = N.
    for (let l = 1; l * l * l <= N; l++) {
        if (N % l === 0) {
            const remainingVolume = N / l; // This is the product w * h

            // Iterate through possible values for 'w' (width)
            // 'w' must be a factor of remainingVolume.
            // We enforce w >= l as part of l <= w <= h.
            // 'w' can go up to sqrt(remainingVolume) because if w > sqrt(remainingVolume),
            // then w*w > remainingVolume, implying h = remainingVolume / w would be < w,
            // violating w <= h.
            for (let w = l; w * w <= remainingVolume; w++) {
                if (remainingVolume % w === 0) {
                    const h = remainingVolume / w; // This is the height

                    // At this point, we have a valid triplet (l, w, h) such that l*w*h = N.
                    // The conditions l <= w (from loop start) and w <= h (from loop end condition for w)
                    // ensure we have found a unique set of dimensions.
                    const currentSurface = 2 * (l * w + l * h + w * h);

                    // Update minSurface if a smaller one is found
                    if (currentSurface < minSurface) {
                        minSurface = currentSurface;
                    }
                }
            }
        }
    }

    // --- Calculate Maximum Surface Area ---
    // To maximize surface area, the cuboid should be as "flat" or "long" as possible.
    // This occurs when two dimensions are minimized (set to 1) and the third is maximized (set to N).
    // Dimensions: (1, 1, N)
    const maxSurface = 2 * (1 * 1 + 1 * N + 1 * N); // Simplified: 2 * (1 + 2 * N)

    // Output the results
    console.log(`${minSurface} ${maxSurface}`);
}

// Call the solve function to run the puzzle logic
solve();