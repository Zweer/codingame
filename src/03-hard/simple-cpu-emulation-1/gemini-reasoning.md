The goal is to emulate a simple CPU with three 8-bit registers (0, 1, 2) initialized to zero. The program is given as a hexadecimal string, where each instruction (opcode) is 4 hex characters long. The emulation stops when an `0000` (EXIT) instruction is encountered, at which point the final values of registers 0, 1, and 2 should be printed in decimal.

**Reasoning:**

1.  **CPU State:**
    *   We'll use a `number[]` array, `registers = [0, 0, 0]`, to represent the three 8-bit registers.
    *   A `pc` (program counter) variable will track the current instruction's starting position in the `program` string. It increments by 4 after each instruction (since each instruction is 4 hex characters).

2.  **8-bit Registers:**
    *   All operations that store a result in a register must ensure the value stays within the 0-255 range. This is achieved by applying a bitwise AND with `0xFF` (`value & 0xFF`). A helper function `clamp8Bit` is used for this.

3.  **Instruction Fetch and Decode Loop:**
    *   The core of the emulator is a `while (true)` loop.
    *   Inside the loop, the current 4-character opcode string (`opcodeStr`) is extracted using `program.substring(pc, pc + 4)`.
    *   The first hexadecimal digit of `opcodeStr` (`opcodeStr[0]`) determines the instruction type (e.g., '1' for LD, '2' for ADD). This digit is parsed using `parseInt(opcodeStr[0], 16)`.
    *   A `switch` statement handles the different instruction types.

4.  **Instruction Implementations:**
    *   **Parsing Arguments:** For instructions like `1knn`, `7knn`, `8knn`, `k` is `parseInt(opcodeStr[1], 16)` and `nn` is `parseInt(opcodeStr.substring(2, 4), 16)`. For `20xy` to `A0xy`, `x` is `parseInt(opcodeStr[2], 16)` and `y` is `parseInt(opcodeStr[3], 16)`.
    *   **`0000` - EXIT:** Prints the register values and breaks out of the loop.
    *   **`1knn` - LD:** Loads the immediate value `nn` into register `k`, clamping it to 8 bits.
    *   **`20xy` - ADD:** Adds `registers[y]` to `registers[x]`. The result is clamped to 8 bits and stored in `registers[x]`. Register `registers[2]` is set to 1 if an overflow occurred (`temp > 255`), otherwise 0.
    *   **`30xy` - SUB:** Subtracts `registers[y]` from `registers[x]`. `registers[2]` is set to 1 if `registers[x] < registers[y]` (borrow), otherwise 0. The result is clamped to 8 bits (handling negative results by wrapping around, e.g., `0 - 1` becomes `255`).
    *   **Bitwise Operations (`40xy` OR, `50xy` AND, `60xy` XOR):** Perform the respective bitwise operation on `registers[x]` and `registers[y]`, storing the 8-bit result in `registers[x]`.
    *   **Skip Instructions (`7knn` SE, `8knn` SNE, `90xy` SE, `A0xy` SNE):** These instructions check a condition. If the condition is met, a `shouldSkipNextInstruction` flag is set to `true`.

5.  **Program Counter Update:**
    *   After each instruction, `pc` is incremented by 4.
    *   If `shouldSkipNextInstruction` is `true` (meaning a skip condition was met), `pc` is incremented by an *additional* 4, effectively skipping the next instruction.
    *   The loop breaks definitively when the `0000` (EXIT) instruction is processed.

This approach covers all specified instructions and handles the 8-bit register constraints and program flow correctly.