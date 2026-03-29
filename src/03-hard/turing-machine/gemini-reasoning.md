A Turing machine is a theoretical model of computation. This puzzle asks us to simulate such a machine based on a given set of rules.

Here's a breakdown of the implementation strategy:

1.  **Understand the Components:**
    *   **Tape:** An array of numbers (`0` to `S-1`). It's initialized with `0`s and has a fixed length `T`.
    *   **Head:** An integer representing the current position on the tape (`0` to `T-1`). It can move left (`L`) or right (`R`).
    *   **State Register:** A string representing the current state of the machine.
    *   **Instruction Table:** A set of rules that dictate what the machine does. For each `(current_state, current_symbol_on_tape)` pair, the table specifies:
        *   `W`: The symbol to write to the current tape cell.
        *   `M`: The direction to move the head (`L` or `R`).
        *   `NEXT`: The next state to transition to, or `HALT` to stop the machine.

2.  **Data Structures:**
    *   `tape`: A `number[]` array of size `T`.
    *   `stateRules`: A `Map<string, Action[]>` where the key is the state name (e.g., "A", "B"). The value is an array of `Action` objects. The index of the array corresponds to the symbol being read (e.g., `actions[0]` for symbol `0`, `actions[1]` for symbol `1`, etc.).
    *   `Action`: A simple object type `{ write: number, move: 'L' | 'R', nextState: string }`.

3.  **Simulation Loop:**
    *   Initialize `tape`, `headPos`, `currentState`, and `actionsPerformed` (counter).
    *   The simulation runs in a `while` loop until one of two conditions is met:
        *   The machine transitions to the `HALT` state.
        *   The head moves out of the tape bounds (`headPos < 0` or `headPos >= T`).
    *   Inside the loop:
        1.  **Boundary Check:** Before performing any action, check if `headPos` is out of bounds. If so, update `headPos` to `-1` (for left) or `T` (for right) as per problem spec, and break the loop.
        2.  **Read Symbol:** Get `currentSymbol = tape[headPos]`.
        3.  **Find Action:** Retrieve the specific action from `stateRules` using `currentState` and `currentSymbol` (as an array index).
        4.  **Perform Action:**
            *   Increment `actionsPerformed`.
            *   Write `action.write` to `tape[headPos]`.
            *   Update `headPos` based on `action.move`.
            *   Set `currentState` to `action.nextState`.

4.  **Input/Output:**
    *   Input lines are parsed using `readline()`.
    *   Output is printed using `console.log()`.

The constraints (`T <= 500`, `N <= 100`, `S <= 5`) are small, so a direct simulation is efficient enough. The problem implies that the machine will eventually halt or go out of bounds, so no explicit step limit for infinite loops is needed.