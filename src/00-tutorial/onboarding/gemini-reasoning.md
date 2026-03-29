The goal of this puzzle is to destroy enemy ships by always targeting the closest one. On each turn, the program receives information about two enemies: their names and their distances.

**Reasoning:**

1.  **Game Loop:** The puzzle describes a continuous game where turns repeat. This implies an infinite loop (`while (true)`) is needed to process each turn.
2.  **Input Processing:**
    *   On each turn, two lines of input are provided.
    *   Each line contains an enemy's name (string) and its distance (number), separated by a space.
    *   We need to read each line using `readline()`.
    *   Then, split the string by space (`split(' ')`) to separate the name and the distance.
    *   The distance part, which is initially a string, must be converted to an integer using `parseInt()` for numerical comparison.
3.  **Decision Logic:**
    *   After parsing the name and distance for both `enemy1` and `enemy2`, we compare their distances (`dist1` and `dist2`).
    *   If `dist1` is less than `dist2`, `enemy1` is the closest.
    *   Otherwise (if `dist2` is less than or equal to `dist1`), `enemy2` is the closest (or equally close).
4.  **Output:**
    *   Based on the comparison, we `console.log()` the name of the chosen enemy (either `enemy1` or `enemy2`). This output tells the game which ship to shoot.

This logic directly follows the puzzle's rule: "output the value of either enemy1 or enemy2 to shoot the closest enemy."

**Code:**