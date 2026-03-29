The problem asks us to implement the seam carving algorithm to reduce the width of a grayscale image. The core idea is to repeatedly find and remove a "vertical seam" (a path of pixels from top to bottom) that has the lowest total "energy". If multiple paths have the same minimum energy, we must choose the one that is lexicographically smallest. We need to output the energy of each removed seam.

Here's a breakdown of the solution strategy:

1.  **Input Parsing**: Read the PGM-ASCII image format. This involves reading the header lines (magic number, dimensions, target width, max intensity) and then the pixel data. The pixel data can span multiple lines, so it's best to read each line and parse the numbers.

2.  **Energy Function Calculation**: For each pixel `(x,y)`, its energy `E(x,y)` is defined as `|dI/dx(x,y)| + |dI/dy(x,y)|`. The differentials `dI/dx` and `dI/dy` are calculated based on the difference in intensity with horizontal and vertical neighbors, respectively. Pixels on the image borders have their corresponding differential set to 0.

    *   `dI/dx(x,y) = I(x+1,y) - I(x-1,y)` if `0 < x < W-1`, else `0`.
    *   `dI/dy(x,y) = I(x,y+1) - I(x,y-1)` if `0 < y < H-1`, else `0`.

3.  **Finding the Lowest Energy Seam (Dynamic Programming)**:
    This is a classic dynamic programming problem. We can define `M[y][x]` as the minimum total energy of a vertical path from the top row (`y=0`) to the pixel `(x,y)`.

    *   **Base Case**: For the first row (`y=0`), `M[0][x] = E(x,0)`.
    *   **Recursive Step**: For `y > 0`, a pixel `(x,y)` can be reached from `(x-1, y-1)`, `(x, y-1)`, or `(x+1, y-1)`.
        `M[y][x] = E(x,y) + min(M[y-1][x-1], M[y-1][x], M[y-1][x+1])`.
        We need to handle boundary conditions for `x` (i.e., `x-1` and `x+1` must be within `[0, currentW-1]`).

    *   **Lexicographical Tie-Breaking**: This is crucial. If multiple previous pixels `(prev_x, y-1)` lead to the same minimum energy `M[y-1][prev_x]` when calculating `M[y][x]`, we must choose the `prev_x` that is smallest. This ensures that the path is "leftmost" from top to bottom. To implement this, when choosing among `(x-1, y-1)`, `(x, y-1)`, `(x+1, y-1)`, we can put them into a temporary list, sort them primarily by their `M` value (energy) and secondarily by their `prev_x` value (ascending). The first element after sorting will be the optimal choice.

    *   **Path Reconstruction**: To reconstruct the actual seam, we need to store not just the minimum energy `M[y][x]` but also the `prev_x` that led to this minimum. Let `P[y][x]` store this `prev_x`. After filling `M` and `P` tables up to `y=H-1`, we find the `x` in the last row (`H-1`) that has the minimum `M[H-1][x]`. If there's a tie, we pick the smallest `x` (this is automatically handled by iterating `x` from 0 upwards and only updating `lastPixelX` if a strictly smaller minimum is found, or if the initial minimum is set by the first encountered `x`). Once this `lastPixelX` is identified, we backtrack using the `P` table: `x(y-1) = P[y][x(y)]` until we reach `y=0`.

4.  **Seam Removal**: Once a seam (represented by an array of `x` coordinates `seamPathX[y]`) is found, we create a new image array with `currentW-1` width. For each row `y`, we iterate through the pixels. If a pixel's `x` coordinate matches `seamPathX[y]`, we skip it. Otherwise, we copy it to the new image, effectively shifting all subsequent pixels in that row one position to the left. The `currentW` is then decremented.

5.  **Iteration**: Repeat steps 3 and 4 for `W - V` times (initial width minus target width). Each time, print the total energy of the removed seam.

**Constraints and Performance**:
Given `W, H < 100`, the maximum image size is roughly `100x100`.
*   Calculating energy for all pixels: `O(W*H)`
*   Filling DP tables `M` and `P`: `O(W*H)` (each cell calculation is constant time)
*   Finding minimum path in last row: `O(W)`
*   Path reconstruction: `O(H)`
*   Image update (seam removal): `O(W*H)`

Each seam removal is `O(W*H)`. Since `W-V` seams are removed (at most `99-3 = 96`), the total complexity is `(W-V) * O(W*H)`. For `96 * 100 * 100 = 960,000` operations, this is well within typical time limits (usually around `10^8` operations per second).