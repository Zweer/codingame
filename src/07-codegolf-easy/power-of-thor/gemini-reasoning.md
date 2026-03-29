The puzzle "Power of Thor" requires Thor to move from a starting position (`initialTX`, `initialTY`) to a target position (`lightX`, `lightY`). The map is 40 units wide (X from 0 to 39) and 18 units high (Y from 0 to 17). Thor moves one unit per turn in one of eight cardinal or intercardinal directions (N, NE, E, SE, S, SW, W, NW). The goal is to reach the light of power.

## Reasoning

The provided pseudo-code gives a clear and effective algorithm:

1.  **Initialization**: Read the target light coordinates (`lightX`, `lightY`) and Thor's initial coordinates (`initialTX`, `initialTY`). Store Thor's current position in mutable variables, say `thorX` and `thorY`.

2.  **Game Loop (each turn)**:
    *   Read `remainingTurns` (this value is not needed for the solution logic but must be read from input).
    *   Determine the vertical movement:
        *   If `thorY` is greater than `lightY`, Thor needs to move North (`N`). Decrement `thorY`.
        *   If `thorY` is less than `lightY`, Thor needs to move South (`S`). Increment `thorY`.
        *   If `thorY` equals `lightY`, no vertical movement is needed.
    *   Determine the horizontal movement:
        *   If `thorX` is greater than `lightX`, Thor needs to move West (`W`). Decrement `thorX`.
        *   If `thorX` is less than `lightX`, Thor needs to move East (`E`). Increment `thorX`.
        *   If `thorX` equals `lightX`, no horizontal movement is needed.
    *   Construct the final direction string by concatenating the vertical direction (if any) and the horizontal direction (if any). For example, if moving South and East, the output is "SE". If only moving North, the output is "N".
    *   Print the direction string to standard output.

This greedy approach works perfectly because the map boundaries are not obstacles (Thor only loses if he moves *outside* the map, which won't happen as the target is always within bounds, and the algorithm always moves towards the target) and the objective is simply to reach a point. Moving along both axes simultaneously (e.g., NE) is optimal for diagonal paths.

To achieve "shortest code possible", variable names are shortened, and `parseInt()` is replaced with the unary plus operator (`+`) for number conversion where applicable.

## Code