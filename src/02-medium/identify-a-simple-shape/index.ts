// Define Point interface for coordinate pairs
interface Point {
    x: number;
    y: number;
}

/**
 * Reads 20 lines of input and constructs the grid.
 * Each line is "c c c ...", so split by space.
 * @returns A 2D boolean array where true is '#' and false is '.'.
 */
function readGrid(): boolean[][] {
    const grid: boolean[][] = [];
    for (let i = 0; i < 20; i++) {
        const line = readline().split(' '); // readline() is provided by CodinGame environment
        grid.push(line.map(char => char === '#'));
    }
    return grid;
}

/**
 * Collects all coordinates of '#' characters from the grid.
 * @param grid The 2D boolean grid.
 * @returns An array of Point objects.
 */
function collectHashCoordinates(grid: boolean[][]): Point[] {
    const hashCoords: Point[] = [];
    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
            if (grid[y][x]) {
                hashCoords.push({ x, y });
            }
        }
    }
    return hashCoords;
}

/**
 * Sorts an array of Point objects based on x then y coordinates.
 * @param points The array of points to sort.
 * @returns A new array with sorted points.
 */
function sortPoints(points: Point[]): Point[] {
    // Create a shallow copy to avoid modifying the original array if it's passed directly
    return [...points].sort((a, b) => {
        if (a.x !== b.x) {
            return a.x - b.x;
        }
        return a.y - b.y;
    });
}

/**
 * Formats the output string for the identified shape and its corners.
 * @param shape The name of the shape (e.g., "POINT", "FILLED SQUARE").
 * @param corners An array of Point objects representing the shape's corners.
 * @returns The formatted output string.
 */
function formatOutput(shape: string, corners: Point[]): string {
    const sortedCorners = sortPoints(corners);
    const coordStrings = sortedCorners.map(p => `(${p.x},${p.y})`);
    return `${shape} ${coordStrings.join(' ')}`;
}

/**
 * Calculates the bounding box (minX, maxX, minY, maxY) for a set of points.
 * @param points An array of Point objects.
 * @returns An object containing min/max x/y, or default values if points array is empty.
 */
function getBoundingBox(points: Point[]) {
    let minX = 20, maxX = -1, minY = 20, maxY = -1;
    if (points.length > 0) {
        minX = Math.min(...points.map(p => p.x));
        maxX = Math.max(...points.map(p => p.x));
        minY = Math.min(...points.map(p => p.y));
        maxY = Math.max(...points.map(p => p.y));
    }
    return { minX, maxX, minY, maxY };
}

/**
 * Main function to solve the puzzle.
 */
function solve() {
    const grid = readGrid();
    const hashCoords = collectHashCoordinates(grid);
    const numHashes = hashCoords.length;

    // Helper to check if a point is a hash and within bounds
    const isHash = (x: number, y: number) => x >= 0 && x < 20 && y >= 0 && y < 20 && grid[y][x];

    // 1. POINT
    if (numHashes === 1) {
        print(formatOutput("POINT", hashCoords)); // print() is provided by CodinGame environment
        return;
    }

    const { minX, maxX, minY, maxY } = getBoundingBox(hashCoords);
    const width = maxX - minX + 1; // Number of cells horizontally
    const height = maxY - minY + 1; // Number of cells vertically

    // Helper to check if a value is between two endpoints (inclusive)
    function isBetween(val: number, a: number, b: number): boolean {
        return (val >= Math.min(a, b) && val <= Math.max(a, b));
    }

    // Check if (px, py) is on the line segment from (x1, y1) to (x2, y2)
    function onSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): boolean {
        // Ensure the point is within the bounding box of the segment
        if (!isBetween(px, x1, x2) || !isBetween(py, y1, y2)) {
            return false;
        }
        // Check if the point is collinear with the segment endpoints using cross product (determinant)
        // (y - y1) * (x2 - x1) === (x - x1) * (y2 - y1)
        return (py - y1) * (x2 - x1) === (px - x1) * (y2 - y1);
    }

    // --- Shape Detection Order ---

    // 2. RECTANGLE / SQUARE (Filled then Empty)
    // A 1x1 rect is a point, already handled. Need width > 1 and height > 1 for rectangles.
    if (width > 1 && height > 1) {
        let isFilledRectCandidate = true;
        let isEmptyRectCandidate = true;
        
        // Iterate through all cells within the bounding box
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const onPerimeter = (x === minX || x === maxX || y === minY || y === maxY);
                const isCurrentHash = isHash(x, y);

                if (onPerimeter) {
                    if (!isCurrentHash) { // Expected hash on perimeter for both filled/empty, but not found
                        isFilledRectCandidate = false;
                        isEmptyRectCandidate = false;
                    }
                } else { // Inner cell
                    if (isCurrentHash) { // Inner hash found, so cannot be empty
                        isEmptyRectCandidate = false;
                    } else { // Missing inner hash, so cannot be filled
                        isFilledRectCandidate = false;
                    }
                }
            }
        }

        // Validate final conditions and numHashes
        if (isFilledRectCandidate && numHashes === (width * height)) {
            const corners = [{ x: minX, y: minY }, { x: maxX, y: minY }, { x: minX, y: maxY }, { x: maxX, y: maxY }];
            if (width === height) {
                print(formatOutput("FILLED SQUARE", corners));
            } else {
                print(formatOutput("FILLED RECTANGLE", corners));
            }
            return;
        }
        if (isEmptyRectCandidate && numHashes === (2 * (width + height) - 4)) {
            const corners = [{ x: minX, y: minY }, { x: maxX, y: minY }, { x: minX, y: maxY }, { x: maxX, y: maxY }];
            if (width === height) {
                print(formatOutput("EMPTY SQUARE", corners));
            } else {
                print(formatOutput("EMPTY RECTANGLE", corners));
            }
            return;
        }
    }

    // 3. LINE
    let isLine = false;
    let lineCorners: Point[] = [];

    // Horizontal line
    if (height === 1 && numHashes === width) {
        let allHashesPresent = true;
        for (let x = minX; x <= maxX; x++) {
            if (!isHash(x, minY)) { allHashesPresent = false; break; }
        }
        if (allHashesPresent) {
            isLine = true;
            lineCorners = [{ x: minX, y: minY }, { x: maxX, y: minY }];
        }
    }
    // Vertical line (else if to avoid conflicts with horizontal, though they're mutually exclusive by height/width=1)
    else if (width === 1 && numHashes === height) {
        let allHashesPresent = true;
        for (let y = minY; y <= maxY; y++) {
            if (!isHash(minX, y)) { allHashesPresent = false; break; }
        }
        if (allHashesPresent) {
            isLine = true;
            lineCorners = [{ x: minX, y: minY }, { x: minX, y: maxY }];
        }
    }
    // Diagonal lines (45 degrees). Must have square bounding box (width == height).
    else if (width === height && numHashes === width) { // numHashes must be equal to width for a solid diagonal line
        // Check TL-BR diagonal: y - x = constant
        let allHashesTLBR = true;
        for (let i = 0; i < width; i++) {
            const x = minX + i;
            const y = minY + i;
            if (!isHash(x, y)) { allHashesTLBR = false; break; }
        }
        if (allHashesTLBR) {
            isLine = true;
            lineCorners = [{ x: minX, y: minY }, { x: maxX, y: maxY }];
        }

        // Check TR-BL diagonal: y + x = constant
        // Only check if not already identified as TL-BR diagonal
        if (!isLine) {
            let allHashesTRBL = true;
            for (let i = 0; i < width; i++) {
                const x = minX + i;
                const y = maxY - i;
                if (!isHash(x, y)) { allHashesTRBL = false; break; }
            }
            if (allHashesTRBL) {
                isLine = true;
                lineCorners = [{ x: minX, y: maxY }, { x: maxX, y: minY }];
            }
        }
    }
    
    // For line check: also verify no hashes outside the candidate line segment exist.
    // The problem constraint "Only one shape per test" and "no ambiguous cases" makes this less critical
    // if the bounding box matches the line, but good practice.
    if (isLine) {
        // Iterate through all cells in the global bounding box and ensure only lineCorners are part of hashCoords.
        // This is implicitly handled by the fact that `numHashes` must exactly match `width` (or `height`)
        // and all *other* cells must be '.' for it to pass the line checks above.
        print(formatOutput("LINE", lineCorners));
        return;
    }

    // 4. TRIANGLE (Filled then Empty)
    // These are assumed to be right-angled triangles whose legs are parallel to axes.
    // W_len and H_len are lengths of the legs (number of units), not counts of cells (+1).
    const W_len = maxX - minX; 
    const H_len = maxY - minY;

    // Helper function to check if a specific triangle configuration (defined by rightAngleCorner and other two corners)
    // is present on the grid, either filled or empty.
    function checkTriangle(rightAngleCorner: Point, otherCorner1: Point, otherCorner2: Point, isFilledCheck: boolean): boolean {
        // Ensure the bounding box of these three vertices matches the overall shape's bounding box
        const txMinX = Math.min(rightAngleCorner.x, otherCorner1.x, otherCorner2.x);
        const txMaxX = Math.max(rightAngleCorner.x, otherCorner1.x, otherCorner2.x);
        const txMinY = Math.min(rightAngleCorner.y, otherCorner1.y, otherCorner2.y);
        const txMaxY = Math.max(rightAngleCorner.y, otherCorner1.y, otherCorner2.y);

        if (txMinX !== minX || txMaxX !== maxX || txMinY !== minY || txMaxY !== maxY) {
            return false; // Bounding box doesn't match for this triangle orientation
        }

        let actualHashesInCorrectPlaces = 0; // Count '#' found in ideal triangle positions

        // Iterate through all cells within the overall bounding box (which matches triangle's bounding box)
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                let isCellInsideTriangle = false;
                let isCellOnPerimeter = false;

                // Determine if cell (x,y) is inside or on the perimeter based on the right angle corner
                if (rightAngleCorner.x === minX && rightAngleCorner.y === minY) { // Right angle at (minX, minY)
                    isCellInsideTriangle = (x >= minX && y >= minY && (W_len * (y - minY) + H_len * (x - minX) <= W_len * H_len));
                    isCellOnPerimeter = (x === minX && y >= minY) || (y === minY && x >= minX) || onSegment(x, y, maxX, minY, minX, maxY);
                } else if (rightAngleCorner.x === maxX && rightAngleCorner.y === minY) { // Right angle at (maxX, minY)
                    isCellInsideTriangle = (x <= maxX && y >= minY && (W_len * (y - minY) + H_len * (maxX - x) <= W_len * H_len));
                    isCellOnPerimeter = (x === maxX && y >= minY) || (y === minY && x <= maxX) || onSegment(x, y, minX, minY, maxX, maxY);
                } else if (rightAngleCorner.x === minX && rightAngleCorner.y === maxY) { // Right angle at (minX, maxY)
                    isCellInsideTriangle = (x >= minX && y <= maxY && (W_len * (maxY - y) + H_len * (x - minX) <= W_len * H_len));
                    isCellOnPerimeter = (x === minX && y <= maxY) || (y === maxY && x >= minX) || onSegment(x, y, minX, minY, maxX, maxY);
                } else if (rightAngleCorner.x === maxX && rightAngleCorner.y === maxY) { // Right angle at (maxX, maxY)
                    isCellInsideTriangle = (x <= maxX && y <= maxY && (W_len * (maxY - y) + H_len * (maxX - x) <= W_len * H_len));
                    isCellOnPerimeter = (x === maxX && y <= maxY) || (y === maxY && x <= maxX) || onSegment(x, y, maxX, minY, minX, maxY);
                } else {
                    return false; // Should not happen for valid bounding box corners
                }

                if (isHash(x, y)) { // Current cell (x,y) is '#'
                    actualHashesInCorrectPlaces++; // Increment count of hashes that are within the current triangle's bounding box
                    if (isFilledCheck && !isCellInsideTriangle) {
                        return false; // Found '#' where it shouldn't be for a filled triangle
                    }
                    if (!isFilledCheck && !isCellOnPerimeter) {
                        return false; // Found '#' where it shouldn't be for an empty triangle (i.e., inside or outside bounding box)
                    }
                } else { // Current cell (x,y) is '.'
                    if (isFilledCheck && isCellInsideTriangle) {
                        return false; // Missing '#' where it should be for a filled triangle
                    }
                    if (!isFilledCheck && isCellOnPerimeter) {
                        return false; // Missing '#' where it should be for an empty triangle's perimeter
                    }
                }
            }
        }
        // If all checks pass for cell positions, ensure the total number of '#' matches.
        return actualHashesInCorrectPlaces === numHashes;
    }

    // Define the 4 corners of the overall bounding box, used as potential triangle vertices
    const v_minX_minY = {x: minX, y: minY};
    const v_maxX_minY = {x: maxX, y: minY};
    const v_minX_maxY = {x: minX, y: maxY};
    const v_maxX_maxY = {x: maxX, y: maxY};

    // Attempt to match Filled Triangles
    if (checkTriangle(v_minX_minY, v_maxX_minY, v_minX_maxY, true)) { // Right angle at (minX, minY)
        print(formatOutput("FILLED TRIANGLE", [v_minX_minY, v_maxX_minY, v_minX_maxY])); return;
    }
    if (checkTriangle(v_maxX_minY, v_minX_minY, v_maxX_maxY, true)) { // Right angle at (maxX, minY)
        print(formatOutput("FILLED TRIANGLE", [v_minX_minY, v_maxX_minY, v_maxX_maxY])); return;
    }
    if (checkTriangle(v_minX_maxY, v_minX_minY, v_maxX_maxY, true)) { // Right angle at (minX, maxY)
        print(formatOutput("FILLED TRIANGLE", [v_minX_minY, v_minX_maxY, v_maxX_maxY])); return;
    }
    if (checkTriangle(v_maxX_maxY, v_maxX_minY, v_minX_maxY, true)) { // Right angle at (maxX, maxY)
        print(formatOutput("FILLED TRIANGLE", [v_maxX_minY, v_minX_maxY, v_maxX_maxY])); return;
    }

    // Attempt to match Empty Triangles
    if (checkTriangle(v_minX_minY, v_maxX_minY, v_minX_maxY, false)) { // Right angle at (minX, minY)
        print(formatOutput("EMPTY TRIANGLE", [v_minX_minY, v_maxX_minY, v_minX_maxY])); return;
    }
    if (checkTriangle(v_maxX_minY, v_minX_minY, v_maxX_maxY, false)) { // Right angle at (maxX, minY)
        print(formatOutput("EMPTY TRIANGLE", [v_minX_minY, v_maxX_minY, v_maxX_maxY])); return;
    }
    if (checkTriangle(v_minX_maxY, v_minX_minY, v_maxX_maxY, false)) { // Right angle at (minX, maxY)
        print(formatOutput("EMPTY TRIANGLE", [v_minX_minY, v_minX_maxY, v_maxX_maxY])); return;
    }
    if (checkTriangle(v_maxX_maxY, v_maxX_minY, v_minX_maxY, false)) { // Right angle at (maxX, maxY)
        print(formatOutput("EMPTY TRIANGLE", [v_maxX_minY, v_minX_maxY, v_maxX_maxY])); return;
    }
}

solve(); // Execute the main function