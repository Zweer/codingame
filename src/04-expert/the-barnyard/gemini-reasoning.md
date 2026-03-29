The problem asks us to determine the number of animals of each species in a barnyard, given the total counts of various animal characteristics (heads, horns, legs, wings, eyes) and a list of the species present. We are provided with the specific characteristics for each type of animal.

This problem can be modeled as a system of linear equations.

**1. Define Animal Characteristics:**
First, we list the characteristics for each animal species. Every animal has 1 head. Non-specified characteristics for an animal type are assumed to be 0 (e.g., Rabbits have 0 horns and 0 wings).

| Animal   | Heads | Horns | Legs | Wings | Eyes |
| :------- | :---- | :---- | :--- | :---- | :--- |
| Rabbits  | 1     | 0     | 4    | 0     | 2    |
| Chickens | 1     | 0     | 2    | 2     | 2    |
| Cows     | 1     | 2     | 4    | 0     | 2    |
| Pegasi   | 1     | 0     | 4    | 2     | 2    |
| Demons   | 1     | 4    | 4    | 2     | 4    |

**2. Formulate the System of Equations:**
Let `n` be the number of species given. The problem states that `n` characteristic totals are provided, which means we will have `n` equations and `n` unknown variables (the count of each species).

Let `x_1, x_2, ..., x_n` be the unknown counts for `species_1, species_2, ..., species_n` respectively (in the order they are given).
Let `c_1, c_2, ..., c_n` be the characteristic types given (e.g., "Heads", "Legs").
Let `T_1, T_2, ..., T_n` be the total counts for these characteristics.

The system of equations will look like this:
`x_1 * (char_1 of species_1) + x_2 * (char_1 of species_2) + ... + x_n * (char_1 of species_n) = T_1`
`x_1 * (char_2 of species_1) + x_2 * (char_2 of species_2) + ... + x_n * (char_2 of species_n) = T_2`
...
`x_1 * (char_n of species_1) + x_2 * (char_n of species_2) + ... + x_n * (char_n of species_n) = T_n`

This can be represented as a matrix equation `A * X = B`, where:
*   `A` is an `n x n` matrix where `A[i][j]` is the count of `characteristic_i` for `species_j`.
*   `X` is an `n x 1` column vector of the unknown animal counts `[x_1, x_2, ..., x_n]^T`.
*   `B` is an `n x 1` column vector of the total characteristic counts `[T_1, T_2, ..., T_n]^T`.

**3. Solve the System using Gaussian Elimination:**
Since `n` is small (between 2 and 5), Gaussian elimination is an efficient and straightforward method to solve this system.

The steps are:
*   **Construct the Augmented Matrix:** Create a single `n x (n+1)` matrix by appending the `B` vector as the `(n+1)`-th column to the `A` matrix. Let's call this `[A|B]`.
*   **Forward Elimination:** Transform the `[A|B]` matrix into an upper triangular form (row echelon form).
    *   For each column `k` from `0` to `n-1` (the pivot column):
        *   Find the row `maxRow` below or at `k` with the largest absolute value in column `k`. Swap this `maxRow` with row `k` to improve numerical stability.
        *   Normalize row `k`: Divide row `k` by its pivot element `A[k][k]` so that `A[k][k]` becomes 1.
        *   Eliminate elements below the pivot: For each row `i` below `k`, subtract a multiple of row `k` from row `i` such that `A[i][k]` becomes 0. Apply the same operation to the `B` part of the augmented matrix.
*   **Back Substitution:** Once the matrix is in upper triangular form, solve for the variables starting from the last one and working backward.
    *   `x_n` can be directly found from the last row.
    *   Then, `x_{n-1}` can be found using `x_n`, and so on, until `x_1` is found.

**4. Output:**
Print the calculated animal counts, rounded to the nearest integer, in the same order as the species were provided in the input.

**Example Walkthrough (from problem description):**
Input:
```
2
Rabbits Chickens
Heads 5
Legs 14
```

*   `n = 2`
*   `speciesOrder = ["Rabbits", "Chickens"]`
*   `characteristicNames = ["Heads", "Legs"]`, `characteristicTotals = [5, 14]`

The system becomes:
`1 * x_Rabbits + 1 * x_Chickens = 5` (Heads equation)
`4 * x_Rabbits + 2 * x_Chickens = 14` (Legs equation)

Augmented Matrix `[A|B]`:
```
[[1, 1, | 5],
 [4, 2, | 14]]
```

**Forward Elimination:**
1.  **Pivot row 0 (k=0):**
    *   Pivot element is `augmentedMatrix[0][0] = 1`.
    *   Eliminate `augmentedMatrix[1][0]`: `R1 = R1 - 4 * R0`
    ```
    [[1, 1, | 5],
     [0, -2, | -6]]
    ```
2.  **Pivot row 1 (k=1):**
    *   Pivot element is `augmentedMatrix[1][1] = -2`.
    *   Normalize `R1`: `R1 = R1 / -2`
    ```
    [[1, 1, | 5],
     [0, 1, | 3]]
    ```

**Back Substitution:**
*   From `R1`: `1 * x_Chickens = 3` => `x_Chickens = 3`
*   From `R0`: `1 * x_Rabbits + 1 * x_Chickens = 5` => `x_Rabbits + 3 = 5` => `x_Rabbits = 2`

Output:
```
Rabbits 2
Chickens 3
```

This matches the example output.