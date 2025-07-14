// Standard CodinGame input/output functions (assume these are provided by the environment)
declare function readline(): string;
declare function print(message: any): void;

function solve() {
    // 1. Input Parsing
    readline(); // P2 - magic number, ignore
    const [W_str, H_str] = readline().split(' ');
    let currentW = parseInt(W_str, 10); // Initial width
    const H = parseInt(H_str, 10);       // Height

    const targetWidthLine = readline(); // # V
    const targetV = parseInt(targetWidthLine.substring(targetWidthLine.indexOf(' ') + 1), 10); // Target width

    readline(); // 255 - max intensity, ignore

    // Initialize the image as a 2D array (H rows, currentW columns initially)
    let image: number[][] = Array(H).fill(0).map(() => []); 
    for (let r = 0; r < H; r++) {
        const rowStr = readline();
        // Split by one or more spaces, filter out empty strings (e.g., from double spaces), and map to numbers
        const rowPixels = rowStr.split(/\s+/).filter(s => s.length > 0).map(Number);
        image[r] = rowPixels; // Assign the parsed row
    }

    // Function to calculate the energy E(x,y) for a pixel
    const calculateEnergy = (img: number[][], currentW: number, H: number, x: number, y: number): number => {
        let dIx = 0;
        // dI/dx(x,y) = I(x+1,y) - I(x-1,y) if 0 < x < W-1, else 0
        if (x > 0 && x < currentW - 1) {
            dIx = img[y][x + 1] - img[y][x - 1];
        }
        let dIy = 0;
        // dI/dy(x,y) = I(x,y+1) - I(x,y-1) if 0 < y < H-1, else 0
        if (y > 0 && y < H - 1) {
            dIy = img[y + 1][x] - img[y - 1][x];
        }
        return Math.abs(dIx) + Math.abs(dIy);
    };

    // Function to remove a seam from the image
    const removeSeam = (img: number[][], H: number, currentW: number, seamPathX: number[]): number[][] => {
        const newImage: number[][] = Array(H).fill(0).map(() => Array(currentW - 1).fill(0));
        for (let y = 0; y < H; y++) {
            let newX = 0; // Index for the new image row
            for (let x = 0; x < currentW; x++) {
                if (x === seamPathX[y]) {
                    // Skip the pixel at seamPathX[y] as it's being removed
                    continue;
                }
                newImage[y][newX] = img[y][x];
                newX++;
            }
        }
        return newImage;
    };

    // Main Seam Carving Loop: remove (initialW - targetV) seams
    const numSeamsToRemove = currentW - targetV;
    for (let s = 0; s < numSeamsToRemove; s++) {
        // DP table M[y][x]: stores the minimum energy to reach pixel (x,y) from the top row.
        const M: number[][] = Array(H).fill(0).map(() => Array(currentW).fill(Infinity));
        // Backtracking table P[y][x]: stores the x-coordinate of the previous pixel (in row y-1)
        // that leads to the minimum energy path for (x,y).
        const P: number[][] = Array(H).fill(0).map(() => Array(currentW).fill(-1));

        // 1. Initialize the first row of the DP table (y=0)
        for (let x = 0; x < currentW; x++) {
            M[0][x] = calculateEnergy(image, currentW, H, x, 0);
        }

        // 2. Fill the DP tables M and P for subsequent rows (y from 1 to H-1)
        for (let y = 1; y < H; y++) {
            for (let x = 0; x < currentW; x++) {
                const currentPixelEnergy = calculateEnergy(image, currentW, H, x, y);

                // Define potential previous pixels and their accumulated energies
                const potentialPrevPaths: { energy: number; prevX: number }[] = [];
                
                // Possible previous pixels are (x-1, y-1), (x, y-1), (x+1, y-1)
                // Add left neighbor (if exists)
                if (x > 0) {
                    potentialPrevPaths.push({ energy: M[y-1][x-1], prevX: x-1 });
                }
                // Add straight neighbor
                potentialPrevPaths.push({ energy: M[y-1][x], prevX: x });
                // Add right neighbor (if exists)
                if (x < currentW - 1) {
                    potentialPrevPaths.push({ energy: M[y-1][x+1], prevX: x+1 });
                }

                // Sort candidates:
                // Primary sort key: accumulated energy (lowest first)
                // Secondary sort key: previous x-coordinate (lowest first for lexicographical tie-breaking)
                potentialPrevPaths.sort((a, b) => {
                    if (a.energy !== b.energy) {
                        return a.energy - b.energy; 
                    }
                    return a.prevX - b.prevX; 
                });

                const chosenPrevPath = potentialPrevPaths[0]; // The best choice after sorting
                
                M[y][x] = currentPixelEnergy + chosenPrevPath.energy;
                P[y][x] = chosenPrevPath.prevX;
            }
        }

        // 3. Find the minimum energy path's end point (last pixel in row H-1)
        let minPathEnergySum = Infinity;
        let lastPixelX = -1; // This will be the x-coordinate of the pixel at y=H-1

        for (let x = 0; x < currentW; x++) {
            if (M[H - 1][x] < minPathEnergySum) {
                minPathEnergySum = M[H - 1][x];
                lastPixelX = x;
            } else if (M[H - 1][x] === minPathEnergySum) {
                // If energies are equal, the loop implicitly prefers the leftmost x
                // because `x` is increasing. No explicit `if (x < lastPixelX)` is needed.
            }
        }
        
        print(minPathEnergySum); // Output the total energy of the removed seam

        // 4. Reconstruct the seam path (from bottom-up using the P table)
        const seamPathX: number[] = Array(H);
        let currentX = lastPixelX; // Start from the last pixel of the minimum path
        for (let y = H - 1; y >= 0; y--) {
            seamPathX[y] = currentX; // Store the x-coordinate for the current row
            if (y > 0) { // If not the top row, get the previous pixel's x-coordinate
                currentX = P[y][currentX]; 
            }
        }

        // 5. Remove the identified seam and update the image and its current width
        image = removeSeam(image, H, currentW, seamPathX);
        currentW--; // Decrement the image width
    }
}

solve(); // Execute the main solve function