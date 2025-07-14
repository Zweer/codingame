// Global constants, tunable based on image characteristics and constraints
const W_THRESHOLD_FOR_STAFF_LINE_PERCENT = 0.8; // A row is considered a staff line if >= 80% pixels are black
const MIN_STAFF_LINE_LENGTH_RATIO = 0.9; // For filtering groups, ensure lines are very long
const HEAD_FILL_RATIO_THRESHOLD = 0.5; // If fill ratio > this, it's a quarter note. Else half. (needs tuning)
const NOTE_MIN_PIXELS = 15; // Minimum area (pixels) for a connected component to be considered a note blob
const NOTE_DIMENSION_TOLERANCE_RATIO = 0.6; // Min ratio for note head dimensions relative to lineToLineSpacing
const MAX_NOTE_HEAD_OVERLAP_RATIO = 1.5; // Max ratio for note head dimensions relative to lineToLineSpacing

// Type definitions for clarity
type Pixel = boolean; // true for black, false for white

interface BlobInfo {
    pixels: { x: number; y: number }[];
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    y_center: number; // Y-coordinate of the widest horizontal slice (center of the head)
    maxHeadWidth: number; // Width of the widest horizontal slice
}

interface Note {
    x: number; // For sorting notes from left to right
    y_center: number; // For pitch detection
    type: 'H' | 'Q';
    pitch: string;
}

// Global variables for image data and staff properties
let W: number;
let H: number;
let grid: Pixel[][];
let visited: boolean[][]; // To track visited pixels during BFS/DFS for notes

let staffLineY: number[] = []; // Y-coordinates of the 5 staff lines, sorted (lowest Y means highest on screen)
let lineThickness: number = 0; // Average thickness of staff lines
let lineToLineSpacing: number = 0; // Average distance between centers of adjacent staff lines

/**
 * Decodes the DWE string into a 2D pixel grid.
 */
function decodeDWE(dweString: string) {
    grid = Array(H).fill(0).map(() => Array(W).fill(false)); // Initialize with white pixels
    let pixelIndex = 0;
    const parts = dweString.split(' ');

    for (let i = 0; i < parts.length; i += 2) {
        const colorChar = parts[i];
        const length = parseInt(parts[i + 1]);
        const color = (colorChar === 'B'); // true for black, false for white

        for (let j = 0; j < length; j++) {
            const y = Math.floor(pixelIndex / W);
            const x = pixelIndex % W;
            if (y < H) { // Ensure pixel is within image bounds
                grid[y][x] = color;
            }
            pixelIndex++;
        }
    }
}

/**
 * Identifies the 5 staff lines by analyzing black pixel counts per row.
 */
function findStaffLines() {
    const blackPixelCounts: number[] = Array(H).fill(0);
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            if (grid[y][x]) {
                blackPixelCounts[y]++;
            }
        }
    }

    const candidateLineGroups: { yCoords: number[], center: number, thickness: number }[] = [];
    let currentGroup: number[] = [];
    for (let y = 0; y < H; y++) {
        // A row is considered a candidate for a staff line if it's mostly black
        if (blackPixelCounts[y] > W * W_THRESHOLD_FOR_STAFF_LINE_PERCENT) {
            if (currentGroup.length === 0 || y === currentGroup[currentGroup.length - 1] + 1) {
                // If it's the first in a group or contiguous with the previous
                currentGroup.push(y);
            } else {
                // End of a group, save it and start new
                candidateLineGroups.push({
                    yCoords: currentGroup,
                    center: Math.round(currentGroup.reduce((sum, val) => sum + val, 0) / currentGroup.length),
                    thickness: currentGroup.length
                });
                currentGroup = [y];
            }
        }
    }
    // Add the last group if it exists
    if (currentGroup.length > 0) {
        candidateLineGroups.push({
            yCoords: currentGroup,
            center: Math.round(currentGroup.reduce((sum, val) => sum + val, 0) / currentGroup.length),
            thickness: currentGroup.length
        });
    }

    // Sort groups by their center Y coordinate (top to bottom on screen)
    candidateLineGroups.sort((a, b) => a.center - b.center);

    // Filter to find the 5 most consistently spaced lines.
    // This handles cases where there might be more than 5 line-like features (e.g., ledger lines, noise).
    let bestGroupOfFive: { yCoords: number[], center: number, thickness: number }[] = [];
    let minAvgSpacingDiff = Infinity; // Using L1 norm of difference from average spacing

    if (candidateLineGroups.length >= 5) {
        for (let i = 0; i <= candidateLineGroups.length - 5; i++) {
            const currentFive = candidateLineGroups.slice(i, i + 5);
            const spacings: number[] = [];
            for (let j = 0; j < 4; j++) {
                spacings.push(currentFive[j + 1].center - currentFive[j].center);
            }
            const avgSpacing = spacings.reduce((sum, s) => sum + s, 0) / 4;
            const totalDiff = spacings.reduce((sum, s) => sum + Math.abs(s - avgSpacing), 0);

            // Also check if these 5 lines are sufficiently long (not short ledger lines)
            const allLongEnough = currentFive.every(g => blackPixelCounts[g.center] > W * MIN_STAFF_LINE_LENGTH_RATIO);

            if (allLongEnough && totalDiff < minAvgSpacingDiff) {
                minAvgSpacingDiff = totalDiff;
                bestGroupOfFive = currentFive;
            }
        }
    }

    if (bestGroupOfFive.length === 5) {
        staffLineY = bestGroupOfFive.map(g => g.center);
        lineThickness = Math.round(bestGroupOfFive.reduce((sum, g) => sum + g.thickness, 0) / bestGroupOfFive.length);
    } else {
        // Fallback or error handling if 5 consistent staff lines aren't found.
        // This scenario means the input image is highly irregular or logic needs adjustment.
        // For CodinGame puzzles, test cases usually conform well.
        console.error("Could not find exactly 5 well-defined staff lines. Proceeding with best guess.");
        // If not 5, try to use the most prominent 5 if available
        if (candidateLineGroups.length >= 5) {
            staffLineY = candidateLineGroups.map(g => g.center).slice(0, 5); // Just take first 5
            lineThickness = Math.round(candidateLineGroups.slice(0,5).reduce((sum, g) => sum + g.thickness, 0) / 5);
        } else {
            // Hardcoded fallback, likely to fail tests if activated.
            staffLineY = [H / 2 - 2 * 10, H / 2 - 1 * 10, H / 2, H / 2 + 1 * 10, H / 2 + 2 * 10]; // Arbitrary spacing
            lineThickness = 2;
        }
    }
    
    // Calculate lineToLineSpacing using the finalized 5 staff lines
    if (staffLineY.length === 5) {
        let totalSpacing = 0;
        for (let i = 0; i < 4; i++) {
            totalSpacing += (staffLineY[i + 1] - staffLineY[i]);
        }
        lineToLineSpacing = totalSpacing / 4;
    } else {
        // If we still don't have 5 lines, lineToLineSpacing calculation might be off.
        // Estimate based on constraints: min 8px space, min 4x line width.
        // If line is 1px, space is 8px. Center-to-center is 1+8=9.
        // If line is 2px, space is 8px. Center-to-center is 2+8=10.
        // Let's use 10-12 as a heuristic if not properly calculated.
        lineToLineSpacing = lineThickness + Math.max(8, 4 * lineThickness); 
    }
    debugLog(`Staff Lines Y: ${staffLineY.join(', ')}`);
    debugLog(`Line Thickness: ${lineThickness}`);
    debugLog(`Line to Line Spacing: ${lineToLineSpacing}`);
}

/**
 * Performs BFS/DFS to find a connected component (blob) of black pixels.
 */
function getBlob(startY: number, startX: number): BlobInfo | null {
    const q: { y: number; x: number }[] = [{ y: startY, x: startX }];
    const pixels: { y: number; x: number }[] = [];
    let minX = W, maxX = -1, minY = H, maxY = -1;

    // Use a local visited for the current BFS to avoid re-adding
    const localVisited = new Set<string>(); // "y,x" string key

    while (q.length > 0) {
        const { y, x } = q.shift()!;
        const key = `${y},${x}`;

        if (y < 0 || y >= H || x < 0 || x >= W || visited[y][x] || localVisited.has(key) || !grid[y][x]) {
            continue;
        }

        visited[y][x] = true; // Mark globally visited
        localVisited.add(key);
        pixels.push({ y, x });

        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);

        // Add 8-directional neighbors
        q.push({ y: y + 1, x: x });
        q.push({ y: y - 1, x: x });
        q.push({ y: y, x: x + 1 });
        q.push({ y: y, x: x - 1 });
        q.push({ y: y + 1, x: x + 1 });
        q.push({ y: y + 1, x: x - 1 });
        q.push({ y: y - 1, x: x + 1 });
        q.push({ y: y - 1, x: x - 1 });
    }

    if (pixels.length < NOTE_MIN_PIXELS) {
        return null; // Too small to be a note (likely noise)
    }

    // Identify the y-coordinate of the widest horizontal slice of the blob
    // This is used to find the center of the note head.
    const yWidthMap: Map<number, { minX: number; maxX: number }> = new Map();
    for (const p of pixels) {
        if (!yWidthMap.has(p.y)) {
            yWidthMap.set(p.y, { minX: p.x, maxX: p.x });
        } else {
            const current = yWidthMap.get(p.y)!;
            current.minX = Math.min(current.minX, p.x);
            current.maxX = Math.max(current.maxX, p.x);
        }
    }

    let y_center_of_head = -1;
    let maxHeadWidth = -1;
    for (const [y_slice, { minX: sliceMinX, maxX: sliceMaxX }] of yWidthMap.entries()) {
        const currentWidth = sliceMaxX - sliceMinX + 1;
        if (currentWidth > maxHeadWidth) {
            maxHeadWidth = currentWidth;
            y_center_of_head = y_slice;
        }
    }

    return { pixels, minX, maxX, minY, maxY, y_center: y_center_of_head, maxHeadWidth };
}

/**
 * Determines if a note is a Half (H) or Quarter (Q) note.
 */
function getNoteType(blobInfo: BlobInfo): 'H' | 'Q' {
    const { pixels, y_center, maxHeadWidth } = blobInfo;

    // Approximate the bounding box of the note head for fill ratio calculation.
    // The note head diameter is roughly `lineToLineSpacing`.
    const headRadius = Math.round(lineToLineSpacing / 2);
    const headMinY = Math.max(0, y_center - headRadius);
    const headMaxY = Math.min(H - 1, y_center + headRadius);

    // Use a proportional width around the widest slice
    const headApproxWidth = Math.round(maxHeadWidth); // Or could be lineToLineSpacing
    const headMinX = Math.max(0, blobInfo.minX); // Adjusted to be centered on wide part?
    const headMaxX = Math.min(W - 1, blobInfo.maxX);

    let blackPixelsInHead = 0;
    
    // Count black pixels that are part of this blob AND fall within the estimated head area.
    for (const p of pixels) {
        if (p.y >= headMinY && p.y <= headMaxY && p.x >= headMinX && p.x <= headMaxX) {
            blackPixelsInHead++;
        }
    }

    // Calculate total theoretical pixel area of the head's bounding box
    const totalPixelsInHead = (headMaxX - headMinX + 1) * (headMaxY - headMinY + 1);

    if (totalPixelsInHead === 0) return 'Q'; // Should not happen with valid blobs

    const fillRatio = blackPixelsInHead / totalPixelsInHead;
    
    debugLog(`Note at x=${blobInfo.minX}, y_center=${y_center}, maxHeadWidth=${maxHeadWidth}. Fill Ratio: ${fillRatio.toFixed(2)}`);

    return fillRatio > HEAD_FILL_RATIO_THRESHOLD ? 'Q' : 'H';
}

/**
 * Determines the pitch (A-G) of a note based on its vertical center.
 */
function getNotePitch(y_center: number): string {
    const notesMap: { y: number; name: string }[] = [];
    const half_spacing = lineToLineSpacing / 2;

    // Staff lines are from lowest Y to highest Y on the screen.
    // E4 is on staffLineY[0] (lowest physical line). F5 is on staffLineY[4] (highest physical line).
    // Higher musical pitch generally means lower Y coordinate on screen.

    // Notes sorted by their Y position (from highest pitch / lowest Y to lowest pitch / highest Y)
    // Ledger line A5
    notesMap.push({ y: staffLineY[4] - half_spacing * 2, name: 'A' }); 
    // G5 (space above F5)
    notesMap.push({ y: staffLineY[4] - half_spacing, name: 'G' });     
    // F5 (5th line)
    notesMap.push({ y: staffLineY[4], name: 'F' });                    
    // E5 (space between D5 and F5)
    notesMap.push({ y: staffLineY[3] - half_spacing, name: 'E' });     
    // D5 (4th line)
    notesMap.push({ y: staffLineY[3], name: 'D' });                    
    // C5 (space between B4 and D5)
    notesMap.push({ y: staffLineY[2] - half_spacing, name: 'C' });     
    // B4 (3rd line)
    notesMap.push({ y: staffLineY[2], name: 'B' });                    
    // A4 (space between G4 and B4)
    notesMap.push({ y: staffLineY[1] - half_spacing, name: 'A' });     
    // G4 (2nd line)
    notesMap.push({ y: staffLineY[1], name: 'G' });                    
    // F4 (space between E4 and G4)
    notesMap.push({ y: staffLineY[0] - half_spacing, name: 'F' });     
    // E4 (1st line)
    notesMap.push({ y: staffLineY[0], name: 'E' });                    
    // D4 (space below E4)
    notesMap.push({ y: staffLineY[0] + half_spacing, name: 'D' });     
    // Ledger line C4
    notesMap.push({ y: staffLineY[0] + half_spacing * 2, name: 'C' }); 

    // Find the closest note pitch by comparing Y-center
    let closestNote = notesMap[0].name;
    let minDiff = Math.abs(y_center - notesMap[0].y);

    for (let i = 1; i < notesMap.length; i++) {
        const diff = Math.abs(y_center - notesMap[i].y);
        if (diff < minDiff) {
            minDiff = diff;
            closestNote = notesMap[i].name;
        }
    }
    return closestNote;
}

// --- Main Program Logic ---

// Read input dimensions
const [inputW, inputH] = readline().split(' ').map(Number);
W = inputW;
H = inputH;

// Read DWE string
const dweString = readline();

// 1. Decode the image
decodeDWE(dweString);

// 2. Find staff lines
findStaffLines();

const detectedNotes: Note[] = [];
visited = Array(H).fill(0).map(() => Array(W).fill(false)); // Initialize visited grid for note detection

// Iterate columns first, then rows, to implicitly get notes from left to right
for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
        if (grid[y][x] && !visited[y][x]) { // If black and not visited
            const blob = getBlob(y, x); // Get the connected component
            if (blob) {
                // Filter blobs that are not notes
                const blobWidth = blob.maxX - blob.minX + 1;
                const blobHeight = blob.maxY - blob.minY + 1;

                // Heuristics for a note head:
                // 1. Its widest part should be comparable to the line spacing (approximate diameter)
                const expectedDiameterMin = lineToLineSpacing * NOTE_DIMENSION_TOLERANCE_RATIO;
                const expectedDiameterMax = lineToLineSpacing * MAX_NOTE_HEAD_OVERLAP_RATIO;

                if (blob.maxHeadWidth < expectedDiameterMin || blob.maxHeadWidth > expectedDiameterMax) {
                    debugLog(`Filtered: Blob at (${blob.minX},${blob.y_center}) maxHeadWidth ${blob.maxHeadWidth} not within expected range (${expectedDiameterMin}-${expectedDiameterMax}).`);
                    continue; // Max width is too small or too large for a note head
                }

                // 2. Overall blob height should also be reasonable (not just a tiny piece or an extremely long tail)
                if (blobHeight < expectedDiameterMin || blobHeight > H * 0.7) { // 0.7 to avoid very long tails from noise
                    debugLog(`Filtered: Blob at (${blob.minX},${blob.y_center}) height ${blobHeight} not within expected range or too tall.`);
                    continue;
                }

                // 3. Filter blobs that might be staff lines that weren't fully caught by findStaffLines
                if (blobWidth > W * 0.5) {
                    debugLog(`Filtered: Blob at (${blob.minX},${blob.y_center}) width ${blobWidth} too wide, likely staff line.`);
                    continue;
                }
                
                // If the blob passes all checks, assume it's a note
                const noteType = getNoteType(blob);
                const notePitch = getNotePitch(blob.y_center);

                detectedNotes.push({
                    x: blob.minX, // Use minX for sorting left-to-right
                    y_center: blob.y_center,
                    type: noteType,
                    pitch: notePitch
                });
            }
        }
    }
}

// Sort notes by their X coordinate to ensure left-to-right order
detectedNotes.sort((a, b) => a.x - b.x);

// Format and print the final output
const output = detectedNotes.map(note => note.pitch + note.type).join(' ');
console.log(output);