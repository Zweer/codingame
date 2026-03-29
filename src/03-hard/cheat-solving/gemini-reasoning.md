The problem asks us to determine if a Rubik's cube, given its sticker pattern, can be solved by disassembling it and reassembling it into a solved state. This implies that permutations of pieces and orientations of pieces (edge flips, corner twists) are *not* considered unsolvable conditions, as these can be fixed by reassembly.

The core rules for unsolvability via Reassembly&trade; are:
1.  **Any piece with two stickers of the same color (face type) renders the cube unsolvable.** For example, an edge piece should have two distinct face types (e.g., U and F). If it has U and U, it's unsolvable. Similarly, a corner piece should have three distinct face types (e.g., U, F, R). If it has U, F, F or U, U, R, it's unsolvable.
2.  The problem explicitly states that "a corner has two stickers exchanged out of three cannot be solved". This reinforces rule 1, as it means the set of stickers on a piece must be unique (e.g., `{U, F, R}` is valid for a corner, but `{U, U, F}` is not).

The approach is to:
1.  **Parse the input:** The input is an 11-line text representation of the cube's net. We need to store this in a 2D grid (e.g., `string[][]`) for easy access.
2.  **Identify Piece Stickers:** A Rubik's cube consists of:
    *   6 center pieces (1 sticker each): These are always valid as they only have one sticker.
    *   12 edge pieces (2 stickers each): These connect two adjacent faces.
    *   8 corner pieces (3 stickers each): These connect three adjacent faces.
    We need to precisely map the coordinates in the input grid to these 20 non-center pieces.
3.  **Check Solvability:** For each edge piece, retrieve its two stickers and check if they are the same character. For each corner piece, retrieve its three stickers and check if any two are the same character. If any such condition is found, the cube is "UNSOLVABLE". If all pieces pass these checks, the cube is "SOLVABLE".

**Detailed Coordinate Mapping:**

The input diagram is a standard 2D net:
```
    UUU
    UUU
    UUU

LLL FFF RRR BBB
LLL FFF RRR BBB
LLL FFF RRR BBB

    DDD
    DDD
    DDD
```
We can define a helper function `getSticker(face, rowInFace, colInFace)` to convert logical face coordinates into global grid coordinates.
For a 3x3 face grid, `(r, c)` ranges from `(0, 0)` to `(2, 2)`.

*   **U (Up) Face**: `grid[r][4 + c]` (rows 0-2, columns 4-6)
*   **L (Left) Face**: `grid[4 + r][c]` (rows 4-6, columns 0-2)
*   **F (Front) Face**: `grid[4 + r][4 + c]` (rows 4-6, columns 4-6)
*   **R (Right) Face**: `grid[4 + r][8 + c]` (rows 4-6, columns 8-10)
*   **B (Back) Face**: `grid[4 + r][12 + c]` (rows 4-6, columns 12-14)
*   **D (Down) Face**: `grid[8 + r][4 + c]` (rows 8-10, columns 4-6)

Once `getSticker` is defined, we can systematically list the coordinates for all 12 edge and 8 corner pieces. For example, the UF edge piece connects the U-face's bottom-middle sticker (`U[2][1]`) and the F-face's top-middle sticker (`F[0][1]`). The ULF corner connects `U[2][0]`, `L[0][0]`, and `F[0][0]`.

**Algorithm:**
1.  Read all input lines into an array.
2.  Create a 2D character `grid` from the input lines.
3.  Define two lists: `edgePieces` and `cornerPieces`. Each entry in these lists will contain the face and 3x3 coordinates for the stickers of that physical piece.
    *   For `edgePieces`, each entry will be `[face1, r1, c1, face2, r2, c2]`.
    *   For `cornerPieces`, each entry will be `[face1, r1, c1, face2, r2, c2, face3, r3, c3]`.
4.  Initialize `solvable = true`.
5.  Iterate through `edgePieces`:
    *   For each piece, use `getSticker` to get its two sticker characters.
    *   If the two characters are identical, set `solvable = false` and break.
6.  If `solvable` is still `true`, iterate through `cornerPieces`:
    *   For each piece, use `getSticker` to get its three sticker characters.
    *   If any two of the three characters are identical, set `solvable = false` and break.
7.  Print "SOLVABLE" or "UNSOLVABLE" based on the final `solvable` value.