/**
 * Auto-generated code below aims at helping you parse the standard input according to the problem statement.
 **/

// Define an interface for a Building to store its height and ASCII art rows.
interface Building {
    height: number;
    rows: string[]; // Each string represents a row of the building's ASCII art.
}

// Read W (width) and H (height) from the first line of input.
const [W_str, H_str] = readline().split(' ');
const W: number = parseInt(W_str);
const H: number = parseInt(H_str);

// Read the H lines of the ASCII art picture into an array of strings.
const picture: string[] = [];
for (let i = 0; i < H; i++) {
    picture.push(readline());
}

const buildings: Building[] = []; // Array to store all identified buildings.
let maxHeight: number = 0; // Variable to keep track of the maximum building height found.

let j: number = 0; // Column index to iterate through the picture from left to right.

// Loop through the columns of the picture.
while (j < W) {
    // Check if the current column 'j' contains a '#' at the bottom-most row (H-1).
    // This signifies the potential start of a new building.
    // The problem states "every segment is either on the ground or on another segment"
    // and "Buildings are separated by at least one space",
    // so checking the bottom row is sufficient to identify buildings.
    if (picture[H - 1][j] === '#') {
        const currentBuildingStartCol: number = j; // Mark the start column of the current building.
        let currentBuildingEndCol: number = j;     // Initialize end column, will expand right.

        // Find the full horizontal extent (width) of this building
        // by scanning right along the bottom row until a space or end of picture is hit.
        while (currentBuildingEndCol + 1 < W && picture[H - 1][currentBuildingEndCol + 1] === '#') {
            currentBuildingEndCol++;
        }
        
        // Calculate the actual width of the building.
        const buildingWidth: number = currentBuildingEndCol - currentBuildingStartCol + 1;

        // Determine the topmost row (smallest row index) where this building has a segment ('#').
        // This is necessary because buildings might not start from row 0.
        let topRowIndex: number = H; // Initialize to H, which is beyond any valid row index (0 to H-1).

        // Iterate from the top of the picture (row 0) downwards.
        for (let r = 0; r < H; r++) {
            let foundHashInRow: boolean = false;
            // Check if any column within the building's horizontal span has a '#' in the current row 'r'.
            for (let c = currentBuildingStartCol; c <= currentBuildingEndCol; c++) {
                if (picture[r][c] === '#') {
                    topRowIndex = r;      // This is the topmost row containing a segment of this building.
                    foundHashInRow = true;
                    break;                // Found it for this row, no need to check other columns in this row.
                }
            }
            if (foundHashInRow) {
                break; // Found the topmost row of the building, no need to check higher rows.
            }
        }

        // Calculate the building's height based on its topmost row and the total picture height.
        const buildingHeight: number = H - topRowIndex;
        const buildingRows: string[] = []; // Array to store the ASCII art rows of this building.

        // Extract the relevant rows for the building from the `topRowIndex` down to the bottom.
        for (let r = topRowIndex; r < H; r++) {
            // Use substring to get only the part of the row that belongs to this building.
            buildingRows.push(picture[r].substring(currentBuildingStartCol, currentBuildingEndCol + 1));
        }

        // Create the Building object and add it to our list of buildings.
        const currentBuilding: Building = {
            height: buildingHeight,
            rows: buildingRows
        };
        buildings.push(currentBuilding);

        // Update the overall maximum height found so far.
        maxHeight = Math.max(maxHeight, buildingHeight);

        // Move the column pointer 'j' past the current building.
        // The next iteration will start checking from the column immediately after this building.
        j = currentBuildingEndCol + 1;
    } else {
        // If the current column 'j' at the bottom-most row is a space,
        // it means we are in a gap between buildings or before the first building.
        // Move to the next column.
        j++;
    }
}

// Filter the collected buildings to get only those that have the maximum height.
// This preserves their original left-to-right order.
const highestBuildingsToPrint: Building[] = buildings.filter(b => b.height === maxHeight);

// Print the highest buildings.
for (let i = 0; i < highestBuildingsToPrint.length; i++) {
    const building = highestBuildingsToPrint[i];
    // Print each row of the current highest building.
    for (const row of building.rows) {
        print(row);
    }
    
    // Print an empty line *after* the building, but only if it's not the very last highest building.
    // This matches the output format requirement.
    if (i < highestBuildingsToPrint.length - 1) {
        print("");
    }
}