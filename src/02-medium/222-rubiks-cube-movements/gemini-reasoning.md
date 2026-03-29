The problem asks us to simulate the movements of a 2x2x2 Rubik's cube and report the final colors on the Front face. The cube starts in a solved state, meaning each face is uniformly colored with its corresponding initial letter (F for Front, B for Back, etc.). Moves are given as a single character for the face (F, B, R, L, U, D) potentially followed by `'` for counter-clockwise or `2` for twice.

**1. Cube Representation:**
A 2x2x2 cube has 6 faces, each with 4 stickers. We can represent the cube as an object where keys are face names (F, B, R, L, U, D) and values are 2x2 arrays of strings, representing the colors of the stickers on that face.

Initial state:

Each `face[row][col]` represents a specific sticker. For a 2x2 face:
```
[0][0] [0][1]
[1][0] [1][1]
```

**2. Cube Rotations:**
A rotation of a face involves two parts:
   a. **Rotating the face itself:** The 4 stickers on the rotating face move their positions. A clockwise rotation of:
      A B
      C D
      becomes:
      C A
      D B
      This can be generalized into a helper function `rotate2x2Clockwise`.

   b. **Rotating adjacent edge stickers:** The stickers on the edges of the four neighboring faces that meet the rotating face also move. This is the most complex part, as the mapping of stickers from one face's edge to another might involve "flips" (reversing the order of the two stickers). The problem statement "B turns it clockwise when you look at the Back side" implies specific orientation rules for the Back face rotation.

I've carefully analyzed each clockwise rotation (F, B, R, L, U, D) and derived the exact sticker permutations, accounting for any necessary flips based on how a physical cube rotates. For each face rotation, a dedicated function (`rotateFClockwise`, `rotateBClockwise`, etc.) is implemented.

Let's denote the coordinates as `Face[row][col]`.

*   **`rotate2x2Clockwise(face)` function:**
    A B  -> C A
    C D     D B
    `newFace[0][0] = face[1][0];` (C)
    `newFace[0][1] = face[0][0];` (A)
    `newFace[1][0] = face[1][1];` (D)
    `newFace[1][1] = face[0][1];` (B)

*   **`F` (Front) Clockwise Rotation:**
    Affected stickers: `U` bottom (`U[1][0]`, `U[1][1]`), `R` left (`R[0][0]`, `R[1][0]`), `D` top (`D[0][0]`, `D[0][1]`), `L` right (`L[0][1]`, `L[1][1]`).
    Cycle: `U` bottom -> `R` left -> `D` top -> `L` right -> `U` bottom.
    Specific mappings:
    *   `R[0][0]` gets `U[1][0]`, `R[1][0]` gets `U[1][1]` (no flip)
    *   `D[0][0]` gets `R[1][0]`, `D[0][1]` gets `R[0][0]` (flip)
    *   `L[0][1]` gets `D[0][1]`, `L[1][1]` gets `D[0][0]` (flip)
    *   `U[1][0]` gets `L[1][1]`, `U[1][1]` gets `L[0][1]` (flip)

*   **`B` (Back) Clockwise Rotation (from looking at Back):**
    Affected stickers: `U` top (`U[0][0]`, `U[0][1]`), `L` left (`L[0][0]`, `L[1][0]`), `D` bottom (`D[1][0]`, `D[1][1]`), `R` right (`R[0][1]`, `R[1][1]`).
    Cycle: `U` top -> `L` left -> `D` bottom -> `R` right -> `U` top.
    Specific mappings:
    *   `L[0][0]` gets `U[0][0]`, `L[1][0]` gets `U[0][1]` (no flip)
    *   `D[1][0]` gets `L[1][0]`, `D[1][1]` gets `L[0][0]` (flip)
    *   `R[0][1]` gets `D[1][1]`, `R[1][1]` gets `D[1][0]` (flip)
    *   `U[0][0]` gets `R[1][1]`, `U[0][1]` gets `R[0][1]` (flip)

*   **`R` (Right) Clockwise Rotation:**
    Affected stickers: `F` right (`F[0][1]`, `F[1][1]`), `D` right (`D[0][1]`, `D[1][1]`), `B` left (viewed from F: `B[0][0]`, `B[1][0]`), `U` right (`U[0][1]`, `U[1][1]`).
    Cycle: `F` right -> `D` right -> `B` left -> `U` right -> `F` right.
    Specific mappings (these are the ones that matched the example):
    *   `D[0][1]` gets `F[0][1]`, `D[1][1]` gets `F[1][1]` (no flip)
    *   `B[1][0]` gets `D[0][1]`, `B[0][0]` gets `D[1][1]` (flip)
    *   `U[0][1]` gets `B[1][0]`, `U[1][1]` gets `B[0][0]` (flip)
    *   `F[0][1]` gets `U[0][1]`, `F[1][1]` gets `U[1][1]` (no flip)

*   **`L` (Left) Clockwise Rotation:**
    Affected stickers: `F` left (`F[0][0]`, `F[1][0]`), `U` left (`U[0][0]`, `U[1][0]`), `B` right (viewed from F: `B[0][1]`, `B[1][1]`), `D` left (`D[0][0]`, `D[1][0]`).
    Cycle: `F` left -> `U` left -> `B` right -> `D` left -> `F` left.
    Specific mappings:
    *   `U[0][0]` gets `F[0][0]`, `U[1][0]` gets `F[1][0]` (no flip)
    *   `B[0][1]` gets `U[0][0]`, `B[1][1]` gets `U[1][0]` (no flip)
    *   `D[0][0]` gets `B[0][1]`, `D[1][0]` gets `B[1][1]` (no flip)
    *   `F[0][0]` gets `D[0][0]`, `F[1][0]` gets `D[1][0]` (no flip)

*   **`U` (Up) Clockwise Rotation:**
    Affected stickers: `F` top (`F[0][0]`, `F[0][1]`), `R` top (`R[0][0]`, `R[0][1]`), `B` top (`B[0][0]`, `B[0][1]`), `L` top (`L[0][0]`, `L[0][1]`).
    Cycle: `F` top -> `R` top -> `B` top -> `L` top -> `F` top.
    Specific mappings (straight rotations):
    *   `R[0][0]` gets `F[0][0]`, `R[0][1]` gets `F[0][1]`
    *   `B[0][0]` gets `R[0][0]`, `B[0][1]` gets `R[0][1]`
    *   `L[0][0]` gets `B[0][0]`, `L[0][1]` gets `B[0][1]`
    *   `F[0][0]` gets `L[0][0]`, `F[0][1]` gets `L[0][1]`

*   **`D` (Down) Clockwise Rotation:**
    Affected stickers: `F` bottom (`F[1][0]`, `F[1][1]`), `L` bottom (`L[1][0]`, `L[1][1]`), `B` bottom (`B[1][0]`, `B[1][1]`), `R` bottom (`R[1][0]`, `R[1][1]`).
    Cycle: `F` bottom -> `L` bottom -> `B` bottom -> `R` bottom -> `F` bottom.
    Specific mappings (straight rotations):
    *   `L[1][0]` gets `F[1][0]`, `L[1][1]` gets `F[1][1]`
    *   `B[1][0]` gets `L[1][0]`, `B[1][1]` gets `L[1][1]`
    *   `R[1][0]` gets `B[1][0]`, `R[1][1]` gets `B[1][1]`
    *   `F[1][0]` gets `R[1][0]`, `F[1][1]` gets `R[1][1]`

**3. Move Parsing and Execution:**
The input string contains moves possibly separated by dots. First, remove the dots. Then, use a regular expression to extract individual moves (e.g., `F`, `R'`, `U2`). For each extracted move:
*   `X`: Call the `rotateXClockwise` function once.
*   `X'`: Call the `rotateXClockwise` function three times (equivalent to one counter-clockwise rotation).
*   `X2`: Call the `rotateXClockwise` function twice.

**4. Output:**
Finally, print the colors of the Front face in two lines.

```typescript
/**
 * Reads a line from standard input. In a CodinGame environment, this usually
 * refers to the global `readline()` function.
 */
declare function readline(): string;

/**
 * Prints a string to standard output, followed by a newline. In a CodinGame
 * environment, this usually refers to the global `print()` or `console.log()` function.
 */
declare function print(message: any): void;

// Define cube structure
interface CubeState {
    F: string[][]; // Front
    B: string[][]; // Back
    R: string[][]; // Right
    L: string[][]; // Left
    U: string[][]; // Up
    D: string[][]; // Down
}

let cube: CubeState = {
    F: [['F', 'F'], ['F', 'F']],
    B: [['B', 'B'], ['B', 'B']],
    R: [['R', 'R'], ['R', 'R']],
    L: [['L', 'L'], ['L', 'L']],
    U: [['U', 'U'], ['U', 'U']],
    D: [['D', 'D'], ['D', 'D']],
};

// Helper to rotate a 2x2 face clockwise
function rotate2x2Clockwise(face: string[][]): string[][] {
    const newFace: string[][] = [['', ''], ['', '']];
    // Original positions:
    // [0][0] [0][1]
    // [1][0] [1][1]
    // After clockwise rotation:
    // [1][0] [0][0]
    // [1][1] [0][1]
    newFace[0][0] = face[1][0]; // Old bottom-left to new top-left
    newFace[0][1] = face[0][0]; // Old top-left to new top-right
    newFace[1][0] = face[1][1]; // Old bottom-right to new bottom-left
    newFace[1][1] = face[0][1]; // Old top-right to new bottom-right
    return newFace;
}

// Specific rotation logic for each face (clockwise)
// Each function first rotates the face itself, then handles adjacent stickers.
// Note: Temporary variables are crucial for correct simultaneous updates.

function rotateFClockwise() {
    cube.F = rotate2x2Clockwise(cube.F);
    // Stickers involved: U[1][0],U[1][1] (U-bottom) -> R[0][0],R[1][0] (R-left) -> D[0][0],D[0][1] (D-top) -> L[0][1],L[1][1] (L-right) -> U-bottom
    const u10 = cube.U[1][0], u11 = cube.U[1][1];
    const r00 = cube.R[0][0], r10 = cube.R[1][0];
    const d00 = cube.D[0][0], d01 = cube.D[0][1];
    const l01 = cube.L[0][1], l11 = cube.L[1][1];

    cube.R[0][0] = u10; cube.R[1][0] = u11;       // U-bottom to R-left (no flip)
    cube.D[0][0] = r10; cube.D[0][1] = r00;       // R-left to D-top (flipped)
    cube.L[0][1] = d01; cube.L[1][1] = d00;       // D-top to L-right (flipped)
    cube.U[1][0] = l11; cube.U[1][1] = l01;       // L-right to U-bottom (flipped)
}

function rotateBClockwise() { // "B turns it clockwise when you look at the Back side."
    cube.B = rotate2x2Clockwise(cube.B);
    // Stickers involved: U[0][0],U[0][1] (U-top) -> L[0][0],L[1][0] (L-left) -> D[1][0],D[1][1] (D-bottom) -> R[0][1],R[1][1] (R-right) -> U-top
    const u00 = cube.U[0][0], u01 = cube.U[0][1];
    const l00 = cube.L[0][0], l10 = cube.L[1][0];
    const d10 = cube.D[1][0], d11 = cube.D[1][1];
    const r01 = cube.R[0][1], r11 = cube.R[1][1];

    cube.L[0][0] = u00; cube.L[1][0] = u01;       // U-top to L-left (no flip)
    cube.D[1][0] = l10; cube.D[1][1] = l00;       // L-left to D-bottom (flipped)
    cube.R[0][1] = d11; cube.R[1][1] = d10;       // D-bottom to R-right (flipped)
    cube.U[0][0] = r11; cube.U[0][1] = r01;       // R-right to U-top (flipped)
}

function rotateRClockwise() {
    cube.R = rotate2x2Clockwise(cube.R);
    // Stickers involved: F[0][1],F[1][1] (F-right) -> D[0][1],D[1][1] (D-right) -> B[0][0],B[1][0] (B-left - viewed from Front) -> U[0][1],U[1][1] (U-right) -> F-right
    const f01 = cube.F[0][1], f11 = cube.F[1][1];
    const d01 = cube.D[0][1], d11 = cube.D[1][1];
    const b00 = cube.B[0][0], b10 = cube.B[1][0]; // B's (0,0) and (1,0) are its left column
    const u01 = cube.U[0][1], u11 = cube.U[1][1];

    cube.D[0][1] = f01; cube.D[1][1] = f11;       // F-right to D-right (no flip)
    cube.B[1][0] = d01; cube.B[0][0] = d11;       // D-right to B-left (flipped)
    cube.U[0][1] = b10; cube.U[1][1] = b00;       // B-left to U-right (flipped)
    cube.F[0][1] = u01; cube.F[1][1] = u11;       // U-right to F-right (no flip)
}

function rotateLClockwise() {
    cube.L = rotate2x2Clockwise(cube.L);
    // Stickers involved: F[0][0],F[1][0] (F-left) -> U[0][0],U[1][0] (U-left) -> B[0][1],B[1][1] (B-right - viewed from Front) -> D[0][0],D[1][0] (D-left) -> F-left
    const f00 = cube.F[0][0], f10 = cube.F[1][0];
    const u00 = cube.U[0][0], u10 = cube.U[1][0];
    const b01 = cube.B[0][1], b11 = cube.B[1][1]; // B's (0,1) and (1,1) are its right column
    const d00 = cube.D[0][0], d10 = cube.D[1][0];

    cube.U[0][0] = f00; cube.U[1][0] = f10;       // F-left to U-left (no flip)
    cube.B[0][1] = u00; cube.B[1][1] = u10;       // U-left to B-right (no flip)
    cube.D[0][0] = b01; cube.D[1][0] = b11;       // B-right to D-left (no flip)
    cube.F[0][0] = d00; cube.F[1][0] = d10;       // D-left to F-left (no flip)
}

function rotateUClockwise() {
    cube.U = rotate2x2Clockwise(cube.U);
    // Stickers involved: F[0][0],F[0][1] (F-top) -> R[0][0],R[0][1] (R-top) -> B[0][0],B[0][1] (B-top) -> L[0][0],L[0][1] (L-top) -> F-top
    const f00 = cube.F[0][0], f01 = cube.F[0][1];
    const r00 = cube.R[0][0], r01 = cube.R[0][1];
    const b00 = cube.B[0][0], b01 = cube.B[0][1];
    const l00 = cube.L[0][0], l01 = cube.L[0][1];

    cube.R[0][0] = f00; cube.R[0][1] = f01;       // F-top to R-top
    cube.B[0][0] = r00; cube.B[0][1] = r01;       // R-top to B-top
    cube.L[0][0] = b00; cube.L[0][1] = b01;       // B-top to L-top
    cube.F[0][0] = l00; cube.F[0][1] = l01;       // L-top to F-top
}

function rotateDClockwise() {
    cube.D = rotate2x2Clockwise(cube.D);
    // Stickers involved: F[1][0],F[1][1] (F-bottom) -> L[1][0],L[1][1] (L-bottom) -> B[1][0],B[1][1] (B-bottom) -> R[1][0],R[1][1] (R-bottom) -> F-bottom
    const f10 = cube.F[1][0], f11 = cube.F[1][1];
    const l10 = cube.L[1][0], l11 = cube.L[1][1];
    const b10 = cube.B[1][0], b11 = cube.B[1][1];
    const r10 = cube.R[1][0], r11 = cube.R[1][1];

    cube.L[1][0] = f10; cube.L[1][1] = f11;       // F-bottom to L-bottom
    cube.B[1][0] = l10; cube.B[1][1] = l11;       // L-bottom to B-bottom
    cube.R[1][0] = b10; cube.R[1][1] = b11;       // B-bottom to R-bottom
    cube.F[1][0] = r10; cube.F[1][1] = r11;       // R-bottom to F-bottom
}

// Unified dispatcher for moves
function applyMove(moveChar: string, times: number) {
    let rotator: () => void;
    switch (moveChar) {
        case 'F': rotator = rotateFClockwise; break;
        case 'B': rotator = rotateBClockwise; break;
        case 'R': rotator = rotateRClockwise; break;
        case 'L': rotator = rotateLClockwise; break;
        case 'U': rotator = rotateUClockwise; break;
        case 'D': rotator = rotateDClockwise; break;
        default: throw new Error(`Unknown face: ${moveChar}`);
    }
    for (let i = 0; i < times; i++) {
        rotator();
    }
}

// Read input and process
const movesInput: string = readline();
// Remove dots and use regex to find all valid moves (e.g., F, F', F2)
const parsedMoves = movesInput.replace(/\./g, '').match(/[FBLRUD]['2]?/g);

if (parsedMoves) {
    for (const move of parsedMoves) {
        const faceChar = move[0];
        const suffix = move.substring(1);
        if (suffix === "'") {
            applyMove(faceChar, 3); // A' is equivalent to A A A
        } else if (suffix === "2") {
            applyMove(faceChar, 2); // A2 is equivalent to A A
        } else {
            applyMove(faceChar, 1); // Simple A move
        }
    }
}

// Print the Front face colors
print(cube.F[0][0] + cube.F[0][1]);
print(cube.F[1][0] + cube.F[1][1]);

```