The problem asks us to determine the final state (ON or OFF) of several electrical equipment after a series of switch toggles. We are given wiring descriptions for each equipment, defining how switches are connected in series or parallel. Initially, all switches are OFF.

## Reasoning

1.  **Understanding Circuit Logic:**
    *   **Series Connection (`-`):** For a circuit part connected in series, *all* switches in that part must be ON for the part to conduct electricity. If even one switch is OFF, the entire series part is OFF.
    *   **Parallel Connection (`=`):** For a circuit part connected in parallel, *at least one* switch in that part must be ON for the part to conduct electricity. If all switches are OFF, the entire parallel part is OFF.
    *   **Overall Circuit:** The wiring description indicates that the entire circuit for an equipment is formed by a series connection of multiple "clauses" (sub-circuits). Each clause can be either a series group of switches or a parallel group of switches. For the equipment to be ON, *all* these clauses must evaluate to ON.

2.  **Initial State and Toggles:**
    *   All switches begin in the OFF state.
    *   Tom's actions consist of toggling a specific switch, meaning its state flips from ON to OFF or OFF to ON.

3.  **Data Structures:**
    *   **Switch States:** We need to keep track of the current ON/OFF state of every unique switch. A `Map<string, boolean>` is ideal for this, where the key is the switch label (e.g., "A1") and the value is `true` for ON and `false` for OFF.
    *   **Circuit Definitions:** For each equipment, we need to store its name and its parsed wiring description. The wiring description can be broken down into an ordered list of "clauses". Each clause would be an object containing its `type` ('series' or 'parallel') and an array of `switch` labels involved in that clause.

4.  **Parsing the Input:**
    *   **Number of Circuits (C):** Read the first integer.
    *   **Circuit Lines:** For each of the `C` lines:
        *   The first word is the `EQUIPMENT_NAME`.
        *   The rest of the line is the `WIRING_DESCRIPTION`.
        *   Parse the `WIRING_DESCRIPTION` by splitting it into space-separated parts.
        *   Iterate through these parts. If a part is `'-'` or `'='`, it signals the start of a new clause and its type. Collect subsequent switch labels into this clause's switch list until the next `'-'`, `'='`, or the end of the line.
        *   During parsing, add any encountered switch label to our `switchStates` map, initializing its state to `false` (OFF) if it's not already present.
    *   **Number of Actions (A):** Read the next integer.
    *   **Action Lines:** For each of the `A` lines:
        *   Read the `SWITCH_LABEL`.
        *   Look up this `SWITCH_LABEL` in our `switchStates` map. Toggle its boolean value. If the switch label isn't found (which shouldn't happen based on typical puzzle constraints, but good practice to handle), assume it was OFF and turn it ON.

5.  **Evaluating Circuits:**
    *   Iterate through each stored `Circuit` definition in the order they were provided in the input.
    *   For each circuit, initialize a variable `isEquipmentOn` to `true`.
    *   Iterate through the `clauses` associated with the current circuit:
        *   For a `parallel` clause: Iterate through its switches. If *any* switch in the clause is ON, the `clauseResult` is `true`. Otherwise (if all are OFF), `clauseResult` is `false`.
        *   For a `series` clause: Iterate through its switches. If *any* switch in the clause is OFF, the `clauseResult` is `false`. Otherwise (if all are ON), `clauseResult` is `true`.
        *   After evaluating a clause, if `clauseResult` is `false`, it means the entire equipment is OFF (because clauses are connected in series at the top level). Set `isEquipmentOn` to `false` and break early from checking further clauses for this equipment.
    *   Finally, print the `EQUIPMENT_NAME` followed by `is ON` or `is OFF` based on the final `isEquipmentOn` value.

## Code