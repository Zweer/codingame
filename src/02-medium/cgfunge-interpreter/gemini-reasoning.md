The CGFunge interpreter requires simulating a 2-dimensional program execution on a grid, managing a stack of integers, and handling various commands for flow control, arithmetic, stack manipulation, string mode, and input/output.

Here's a breakdown of the implementation logic:

1.  **Input Reading and Grid Setup**:
    *   Read `N`, the number of lines.
    *   Read each line of the program.
    *   Determine `maxColLength`, the length of the longest line.
    *   Create a `grid` (a 2D array of characters) by splitting each line. Shorter lines are padded with spaces to ensure a rectangular grid. This simplifies toroidal (wrap-around) movement of the program counter.

2.  **Interpreter State**:
    *   `pc_r`, `pc_c`: Program Counter, representing the current row and column. Initialized to `(0, 0)`.
    *   `dr`, `dc`: Direction vector. Initialized to `(0, 1)` for rightward movement.
    *   `stack`: An array of numbers to simulate the stack.
    *   `stringMode`: A boolean flag to track if the interpreter is in string mode. Initialized to `false`.
    *   `programRunning`: A boolean flag to control the main execution loop. Initialized to `true`.

3.  **Helper Functions**:
    *   `popValue()`: Removes and returns the top element from the stack. If the stack is empty, it returns `0`, following common Befunge-like conventions.
    *   `pushValue(val: number)`: Pushes a value onto the stack. It applies modular arithmetic (`% 256`) to ensure the value stays within the `[0, 255]` range, correctly handling negative results from subtraction (e.g., `-3` becomes `253`).
    *   `movePC()`: Updates `pc_r` and `pc_c` by adding `dr` and `dc` respectively. It applies the modulo operator with `N` (number of rows) and `maxColLength` (number of columns) to implement toroidal wrapping of the program counter.

4.  **Main Execution Loop**:
    *   The loop continues as long as `programRunning` is `true`.
    *   In each iteration, it fetches the `char` at the current `(pc_r, pc_c)` position.
    *   **String Mode Handling**: If `stringMode` is active:
        *   If `char` is `'"'`, `stringMode` is toggled off.
        *   Otherwise (any other character), its ASCII code is pushed onto the stack.
    *   **Normal Mode (Not String Mode) Handling**:
        *   **Spaces (` `)**: Ignored. The PC will simply move to the next character.
        *   **End (`E`)**: Sets `programRunning` to `false`, terminating the loop.
        *   **Direction Changes (`>`, `<`, `^`, `v`)**: Update `dr` and `dc` accordingly.
        *   **Digits (`0`-`9`)**: Parse the digit and push it onto the stack.
        *   **Arithmetic (`+`, `-`, `*`)**: Pop two values (`b` then `a`), perform the operation (`a op b`), and push the result back onto the stack using `pushValue` to ensure wrapping.
        *   **Stack Manipulation (`P`, `X`, `D`)**:
            *   `P`: Pops a value (and discards it).
            *   `X`: Pops `b` then `a`, then pushes `b` then `a` (swapping them).
            *   `D`: Pops a value `val`, then pushes `val` twice (duplicating it).
        *   **String Mode Toggle (`"`)**: Toggles `stringMode` to `true`.
        *   **Conditional Jumps (`_`, `|`)**: Pop a value. If `0`, set direction to right/down; otherwise, set to left/up.
        *   **Output (`I`, `C`)**:
            *   `I`: Pops a value and prints it as an integer.
            *   `C`: Pops a value, converts it to its corresponding ASCII character, and prints it.
        *   **Skip (`S`)**: Sets a flag `extraMoveForS` to `true`. This will cause an additional `movePC()` call at the end of the current iteration, effectively skipping the next character.

5.  **Program Counter Movement**:
    *   After processing the current character, if `programRunning` is still `true`:
        *   `movePC()` is called once for the standard step.
        *   If `extraMoveForS` was set (because the current character was `S`), `movePC()` is called a second time.

This structured approach ensures all rules are correctly applied, including modular arithmetic for stack values and toroidal wrapping for program counter movement.